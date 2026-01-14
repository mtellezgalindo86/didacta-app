package com.didacta.api.domain.onboarding;

import com.didacta.api.domain.collaborator.CollaboratorPreUser;
import com.didacta.api.domain.collaborator.CollaboratorPreUserRepository;
import com.didacta.api.domain.group.GroupEntity;
import com.didacta.api.domain.group.GroupRepository;
import com.didacta.api.domain.institution.Institution;
import com.didacta.api.domain.institution.InstitutionRepository;
import com.didacta.api.domain.institution.InstitutionUser;
import com.didacta.api.domain.institution.InstitutionUserRepository;
import com.didacta.api.domain.onboarding.dto.OnboardingDto;
import com.didacta.api.domain.user.AppUser;
import com.didacta.api.domain.user.AppUserRepository;
import com.didacta.api.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final AppUserRepository appUserRepository;
    private final InstitutionRepository institutionRepository;
    private final InstitutionUserRepository institutionUserRepository;
    private final GroupRepository groupRepository;
    private final com.didacta.api.domain.campus.CampusRepository campusRepository;
    private final CollaboratorPreUserRepository collaboratorPreUserRepository;

    @Transactional(readOnly = true)
    public OnboardingDto.MeResponse getMe(String keycloakUserId) {
        AppUser user = appUserRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check memberships
        List<InstitutionUser> memberships = institutionUserRepository.findByUser(user);
        
        // For MVP, 1 user = 1 institution mostly. We take the first active one.
        Optional<InstitutionUser> activeMembership = memberships.stream()
                .filter(m -> "ACTIVE".equals(m.getStatus()))
                .findFirst();

        OnboardingDto.TenantDto tenantDto = null;
        UUID institutionId = null;
        boolean hasInstitution = false;
        boolean hasGroup = false;
        boolean hasCollaborators = false;

        if (activeMembership.isPresent()) {
            hasInstitution = true;
            Institution institution = activeMembership.get().getInstitution();
            institutionId = institution.getId();
            tenantDto = OnboardingDto.TenantDto.builder()
                    .institutionId(institution.getId())
                    .name(institution.getName())
                    .role(activeMembership.get().getRole())
                    .build();

            // Check groups
            List<GroupEntity> groups = groupRepository.findByInstitutionId(institution.getId());
            hasGroup = !groups.isEmpty();

            // Check collaborators
            List<CollaboratorPreUser> collaborators = collaboratorPreUserRepository.findByInstitutionId(institution.getId());
            hasCollaborators = !collaborators.isEmpty();
        }

        String nextStep;
        if (!hasInstitution) {
            nextStep = "STEP_1";
        } else if (!hasGroup) {
            nextStep = "STEP_2";
        } else if (!hasCollaborators) {
            nextStep = "STEP_3";
        } else {
            nextStep = "DONE";
        }

        return OnboardingDto.MeResponse.builder()
                .user(OnboardingDto.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .build())
                .tenant(tenantDto)
                .onboarding(OnboardingDto.OnboardingStatus.builder()
                        .hasInstitution(hasInstitution)
                        .hasGroup(hasGroup)
                        .hasCollaborators(hasCollaborators)
                        .nextStep(nextStep)
                        .build())
                .build();
    }

    @Transactional
    public OnboardingDto.InstitutionCreatedResponse createInstitution(String keycloakUserId, OnboardingDto.CreateInstitutionRequest request) {
        AppUser user = appUserRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has an institution
        List<InstitutionUser> memberships = institutionUserRepository.findByUser(user);
        
        Institution institution;
        if (!memberships.isEmpty()) {
            // Upsert Mode: User wants to correct Step 1
            InstitutionUser membership = memberships.get(0); // Take first one
            institution = membership.getInstitution();
            
            // Update fields
            institution.setName(request.getName());
            institution.setMainLevel(request.getMainLevel());
            institution.setCountry(request.getCountry());
            institution.setTimezone(request.getTimezone());
            
            // Update role
            membership.setRole(request.getRole());
            
            // Update Campus Logic
            // If exists, update its name. If switching logic, might be complex, 
            // but for MVP reset/update default campus.
            if (request.isHasMultipleCampuses() && request.getCampusName() != null && !request.getCampusName().isBlank()) {
                // Find existing campus (likely "Sede Principal" or previously named)
                Optional<com.didacta.api.domain.campus.Campus> existing = campusRepository.findFirstByInstitutionId(institution.getId());
                if (existing.isPresent()) {
                    existing.get().setName(request.getCampusName());
                } else {
                    com.didacta.api.domain.campus.Campus newCampus = new com.didacta.api.domain.campus.Campus();
                    newCampus.setInstitution(institution);
                    newCampus.setName(request.getCampusName());
                    campusRepository.save(newCampus);
                }
            } else {
                 // Revert to "Sede Principal" if they unchecked multiple campuses? 
                 // Maybe keep as is to avoid data loss.
            }
            
            institutionRepository.save(institution);
            institutionUserRepository.save(membership);
        } else {
            // Create Mode
            institution = new Institution();
            institution.setName(request.getName());
            institution.setMainLevel(request.getMainLevel());
            institution.setCountry(request.getCountry());
            institution.setTimezone(request.getTimezone());
            institution.setCreatedByUser(user);
            institutionRepository.save(institution);

            // Create initial Campus
            com.didacta.api.domain.campus.Campus campus = new com.didacta.api.domain.campus.Campus();
            campus.setInstitution(institution);
            if (request.isHasMultipleCampuses() && request.getCampusName() != null && !request.getCampusName().isBlank()) {
                campus.setName(request.getCampusName());
            } else {
                campus.setName("Sede Principal"); // Default hidden name
            }
            campusRepository.save(campus);

            InstitutionUser membership = new InstitutionUser();
            membership.setInstitution(institution);
            membership.setUser(user);
            membership.setRole(request.getRole()); // DIRECTOR, OWNER, etc
            membership.setStatus("ACTIVE");
            institutionUserRepository.save(membership);
        }

        return OnboardingDto.InstitutionCreatedResponse.builder()
                .institutionId(institution.getId())
                .nextStep("STEP_2")
                .build();
    }

    @Transactional
    public OnboardingDto.GroupCreatedResponse createGroup(String keycloakUserId, OnboardingDto.CreateGroupRequest request) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new RuntimeException("No X-Institution-Id header provided");
        }
        UUID institutionId = UUID.fromString(tenantId);

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        // Check for existing group with same name in this institution (Upsert Logic)
        Optional<GroupEntity> existingGroup = groupRepository.findByInstitutionId(institutionId).stream()
                .filter(g -> g.getName().equalsIgnoreCase(request.getName()))
                .findFirst();

        GroupEntity group;
        if (existingGroup.isPresent()) {
            group = existingGroup.get();
        } else {
            group = new GroupEntity();
            group.setInstitution(institution);
            group.setName(request.getName());
            group.setActive(true);
        }
        
        // Update fields (for both new and existing)
        group.setGradeLevel(request.getGradeLevel());
        group.setShift(request.getShift());

        // Assign Campus
        if (request.getCampusId() != null) {
            com.didacta.api.domain.campus.Campus campus = campusRepository.findById(request.getCampusId())
                    .filter(c -> c.getInstitution().getId().equals(institutionId))
                    .orElseThrow(() -> new RuntimeException("Campus not found or does not belong to institution"));
            group.setCampus(campus);
        } else {
            // Find default campus (first one created)
            com.didacta.api.domain.campus.Campus defaultCampus = campusRepository.findFirstByInstitutionId(institutionId)
                    .orElseThrow(() -> new RuntimeException("No campus found for institution"));
            group.setCampus(defaultCampus);
        }

        groupRepository.save(group);

        return OnboardingDto.GroupCreatedResponse.builder()
                .groupId(group.getId())
                .nextStep("STEP_3")
                .build();
    }

    @Transactional
    public OnboardingDto.CollaboratorsCreatedResponse createCollaborators(String keycloakUserId, OnboardingDto.CreateCollaboratorsRequest request) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new RuntimeException("No X-Institution-Id header provided");
        }
        UUID institutionId = UUID.fromString(tenantId);
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        int createdCount = 0;
        for (OnboardingDto.CollaboratorRequest colReq : request.getCollaborators()) {
            // Check if already invited
            // MVP: just ignore duplicates or throw? Ignore for now to be idempotent
            if (collaboratorPreUserRepository.findByInstitutionId(institutionId).stream()
                    .anyMatch(c -> c.getEmail().equalsIgnoreCase(colReq.getEmail()))) {
                continue;
            }

            CollaboratorPreUser collaborator = new CollaboratorPreUser();
            collaborator.setInstitution(institution);
            collaborator.setEmail(colReq.getEmail());
            collaborator.setFullName(colReq.getFullName());
            collaborator.setRole(colReq.getRole());
            collaborator.setStatus("PENDING");
            
            if (colReq.getGroupId() != null) {
                GroupEntity group = groupRepository.findById(colReq.getGroupId())
                        .filter(g -> g.getInstitution().getId().equals(institutionId))
                        .orElse(null);
                collaborator.setGroup(group);
            }

            collaboratorPreUserRepository.save(collaborator);
            createdCount++;
        }

        return OnboardingDto.CollaboratorsCreatedResponse.builder()
                .created(createdCount)
                .nextStep("DONE")
                .build();
    }
    @Transactional(readOnly = true)
    public List<com.didacta.api.domain.campus.Campus> getCampuses() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) return List.of();
        return campusRepository.findAll().stream()
                .filter(c -> c.getInstitution().getId().toString().equals(tenantId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GroupEntity> getGroups() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) return List.of();
        return groupRepository.findByInstitutionId(UUID.fromString(tenantId));
    }

    @Transactional(readOnly = true)
    public OnboardingDto.CreateInstitutionRequest getInstitutionDetails(String keycloakUserId) {
         AppUser user = appUserRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
         
         Optional<InstitutionUser> membership = institutionUserRepository.findByUser(user).stream().findFirst();
         if (membership.isEmpty()) return null;
         
         Institution i = membership.get().getInstitution();
         OnboardingDto.CreateInstitutionRequest req = new OnboardingDto.CreateInstitutionRequest();
         req.setName(i.getName());
         req.setMainLevel(i.getMainLevel());
         req.setCountry(i.getCountry());
         req.setTimezone(i.getTimezone());
         req.setRole(membership.get().getRole());
         
         // Campus info?
         Optional<com.didacta.api.domain.campus.Campus> c = campusRepository.findFirstByInstitutionId(i.getId());
         if (c.isPresent() && !"Sede Principal".equals(c.get().getName())) {
             req.setHasMultipleCampuses(true);
             req.setCampusName(c.get().getName());
         }
         
         return req;
    }
}
