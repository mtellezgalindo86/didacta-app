package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.StaffCommand;
import com.didacta.api.application.dto.StaffResult;
import com.didacta.api.application.mapper.StaffMapper;
import com.didacta.api.application.port.input.ManageStaffUseCase;
import com.didacta.api.application.port.output.*;
import com.didacta.api.domain.exception.DomainException;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ManageStaffService implements ManageStaffUseCase {

    private final StaffMemberRepositoryPort staffMemberRepository;
    private final StaffGroupAssignmentRepositoryPort assignmentRepository;
    private final CollaboratorRepositoryPort collaboratorRepository;
    private final CampusRepositoryPort campusRepository;
    private final GroupRepositoryPort groupRepository;
    private final InstitutionRepositoryPort institutionRepository;
    private final TenantProviderPort tenantProvider;

    @Override
    @Transactional
    public StaffResult.StaffMemberCreated create(StaffCommand.Create command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        if (command.getEmail() != null && !command.getEmail().isBlank()
                && staffMemberRepository.existsByInstitutionIdAndEmail(institutionId, command.getEmail())) {
            throw new DomainException("A staff member with email " + command.getEmail() + " already exists in this institution");
        }

        if (command.getCampusId() != null) {
            campusRepository.findById(command.getCampusId())
                    .filter(c -> c.getInstitution().getId().equals(institutionId))
                    .orElseThrow(() -> new EntityNotFoundException("Campus", command.getCampusId().toString()));
        }

        StaffMember staff = StaffMember.builder()
                .institutionId(institutionId)
                .campusId(command.getCampusId())
                .firstName(command.getFirstName())
                .lastName(command.getLastName())
                .jobTitle(command.getJobTitle())
                .category(command.getCategory())
                .email(command.getEmail())
                .phone(command.getPhone())
                .requiresAccess(command.getRequiresAccess() != null ? command.getRequiresAccess() : false)
                .status("ACTIVE")
                .build();

        String invitationStatus = null;
        if (Boolean.TRUE.equals(staff.getRequiresAccess()) && staff.getEmail() != null && !staff.getEmail().isBlank()) {
            invitationStatus = "PENDING";
            staff.setInvitationStatus(invitationStatus);

            if (!collaboratorRepository.existsByInstitutionIdAndEmail(institutionId, staff.getEmail())) {
                Institution institution = institutionRepository.findById(institutionId)
                        .orElseThrow(() -> new EntityNotFoundException("Institution", institutionId.toString()));

                CollaboratorPreUser collaborator = new CollaboratorPreUser();
                collaborator.setInstitution(institution);
                collaborator.setEmail(staff.getEmail());
                collaborator.setFullName(staff.getFirstName() + " " + staff.getLastName());
                collaborator.setRole(mapCategoryToRole(command.getSystemRole(), command.getCategory()));
                collaborator.setStatus("PENDING");
                collaboratorRepository.save(collaborator);
            }
        }

        staffMemberRepository.save(staff);

        if (command.getGroupAssignments() != null && !command.getGroupAssignments().isEmpty()
                && isAssignableCategory(command.getCategory())) {
            for (StaffCommand.GroupAssignmentEntry entry : command.getGroupAssignments()) {
                createAssignment(staff.getId(), entry.getGroupId(), entry.getAssignmentRole(), institutionId);
            }
        }

        return StaffResult.StaffMemberCreated.builder()
                .id(staff.getId())
                .invitationStatus(invitationStatus)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StaffResult.StaffListResponse list(UUID campusId, String category, String status, String search) {
        UUID institutionId = tenantProvider.getTenantUUID();

        List<StaffMember> staffList = staffMemberRepository.findByFilters(institutionId, campusId, category, status, search);
        long total = staffList.size();

        List<GroupEntity> allGroups = groupRepository.findByInstitutionId(institutionId);
        Map<UUID, String> groupNames = allGroups.stream().collect(Collectors.toMap(GroupEntity::getId, GroupEntity::getName));
        Map<UUID, String> groupGrades = allGroups.stream()
                .collect(Collectors.toMap(GroupEntity::getId, g -> g.getGradeLevel() != null ? g.getGradeLevel() : ""));

        List<Campus> allCampuses = campusRepository.findByInstitutionId(institutionId);
        Map<UUID, String> campusNames = allCampuses.stream().collect(Collectors.toMap(Campus::getId, Campus::getName));

        List<StaffResult.StaffMemberResponse> items = staffList.stream()
                .map(staff -> {
                    List<StaffGroupAssignment> assignments = assignmentRepository.findByStaffMemberId(staff.getId());
                    String campusName = staff.getCampusId() != null ? campusNames.getOrDefault(staff.getCampusId(), "") : "";
                    return StaffMapper.toResponse(staff, assignments, groupNames, groupGrades, campusName);
                })
                .toList();

        return StaffResult.StaffListResponse.builder()
                .items(items)
                .total(total)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StaffResult.StaffMemberResponse getById(UUID staffMemberId) {
        UUID institutionId = tenantProvider.getTenantUUID();

        StaffMember staff = findAndValidate(staffMemberId, institutionId);
        List<StaffGroupAssignment> assignments = assignmentRepository.findByStaffMemberId(staffMemberId);

        Map<UUID, String> groupNames = new HashMap<>();
        Map<UUID, String> groupGrades = new HashMap<>();
        for (StaffGroupAssignment a : assignments) {
            groupRepository.findById(a.getGroupId()).ifPresent(g -> {
                groupNames.put(g.getId(), g.getName());
                groupGrades.put(g.getId(), g.getGradeLevel() != null ? g.getGradeLevel() : "");
            });
        }

        String campusName = "";
        if (staff.getCampusId() != null) {
            campusName = campusRepository.findById(staff.getCampusId())
                    .map(Campus::getName)
                    .orElse("");
        }

        return StaffMapper.toResponse(staff, assignments, groupNames, groupGrades, campusName);
    }

    @Override
    @Transactional
    public StaffResult.StaffMemberResponse update(UUID staffMemberId, StaffCommand.Update command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        StaffMember staff = findAndValidate(staffMemberId, institutionId);

        if (command.getEmail() != null && !command.getEmail().isBlank()
                && !command.getEmail().equals(staff.getEmail())
                && staffMemberRepository.existsByInstitutionIdAndEmail(institutionId, command.getEmail())) {
            throw new DomainException("A staff member with email " + command.getEmail() + " already exists in this institution");
        }

        if (command.getCampusId() != null) {
            campusRepository.findById(command.getCampusId())
                    .filter(c -> c.getInstitution().getId().equals(institutionId))
                    .orElseThrow(() -> new EntityNotFoundException("Campus", command.getCampusId().toString()));
        }

        staff.setFirstName(command.getFirstName());
        staff.setLastName(command.getLastName());
        staff.setJobTitle(command.getJobTitle());
        staff.setCategory(command.getCategory());
        staff.setEmail(command.getEmail());
        staff.setPhone(command.getPhone());
        staff.setCampusId(command.getCampusId());

        if (command.getRequiresAccess() != null) {
            staff.setRequiresAccess(command.getRequiresAccess());
            if (Boolean.TRUE.equals(command.getRequiresAccess())
                    && staff.getInvitationStatus() == null
                    && staff.getEmail() != null && !staff.getEmail().isBlank()) {
                staff.setInvitationStatus("PENDING");
            }
        }

        staffMemberRepository.save(staff);
        return getById(staffMemberId);
    }

    @Override
    @Transactional
    public void changeStatus(UUID staffMemberId, StaffCommand.ChangeStatus command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        StaffMember staff = findAndValidate(staffMemberId, institutionId);
        staff.setStatus(command.getStatus());
        staffMemberRepository.save(staff);

        if ("INACTIVE".equals(command.getStatus())) {
            List<StaffGroupAssignment> assignments = assignmentRepository.findByStaffMemberId(staffMemberId);
            for (StaffGroupAssignment assignment : assignments) {
                assignment.setActive(false);
                assignmentRepository.save(assignment);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffResult.AssignmentResponse> getAssignments(UUID staffMemberId) {
        UUID institutionId = tenantProvider.getTenantUUID();
        findAndValidate(staffMemberId, institutionId);

        List<StaffGroupAssignment> assignments = assignmentRepository.findByStaffMemberId(staffMemberId);

        return assignments.stream()
                .map(a -> {
                    String groupName = "";
                    String gradeLevel = "";
                    var group = groupRepository.findById(a.getGroupId());
                    if (group.isPresent()) {
                        groupName = group.get().getName();
                        gradeLevel = group.get().getGradeLevel() != null ? group.get().getGradeLevel() : "";
                    }
                    return StaffMapper.toAssignmentResponse(a, groupName, gradeLevel);
                })
                .toList();
    }

    @Override
    @Transactional
    public StaffResult.AssignmentResponse assignToGroup(UUID staffMemberId, StaffCommand.AssignGroup command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        StaffMember staff = findAndValidate(staffMemberId, institutionId);

        if (!isAssignableCategory(staff.getCategory())) {
            throw new DomainException("Staff member with category " + staff.getCategory() + " cannot be assigned to groups");
        }

        GroupEntity group = groupRepository.findById(command.getGroupId())
                .filter(g -> g.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new EntityNotFoundException("Group", command.getGroupId().toString()));

        if (assignmentRepository.existsByStaffMemberIdAndGroupId(staffMemberId, command.getGroupId())) {
            throw new DomainException("Staff member is already assigned to this group");
        }

        StaffGroupAssignment assignment = StaffGroupAssignment.builder()
                .staffMemberId(staffMemberId)
                .groupId(command.getGroupId())
                .assignmentRole(command.getAssignmentRole())
                .active(true)
                .build();

        assignmentRepository.save(assignment);

        return StaffMapper.toAssignmentResponse(assignment, group.getName(),
                group.getGradeLevel() != null ? group.getGradeLevel() : "");
    }

    @Override
    @Transactional
    public void removeAssignment(UUID staffMemberId, UUID assignmentId) {
        UUID institutionId = tenantProvider.getTenantUUID();
        findAndValidate(staffMemberId, institutionId);

        StaffGroupAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new EntityNotFoundException("StaffGroupAssignment", assignmentId.toString()));

        if (!assignment.getStaffMemberId().equals(staffMemberId)) {
            throw new DomainException("Assignment does not belong to this staff member");
        }

        assignmentRepository.deleteById(assignmentId);
    }

    @Override
    @Transactional
    public void resendInvitation(UUID staffMemberId) {
        UUID institutionId = tenantProvider.getTenantUUID();

        StaffMember staff = findAndValidate(staffMemberId, institutionId);

        if (!Boolean.TRUE.equals(staff.getRequiresAccess())) {
            throw new DomainException("Staff member does not require platform access");
        }

        if (!"PENDING".equals(staff.getInvitationStatus())) {
            throw new DomainException("Invitation can only be resent when status is PENDING");
        }

        staffMemberRepository.save(staff);
    }

    private StaffMember findAndValidate(UUID staffMemberId, UUID institutionId) {
        StaffMember staff = staffMemberRepository.findById(staffMemberId)
                .orElseThrow(() -> new EntityNotFoundException("StaffMember", staffMemberId.toString()));

        if (!staff.getInstitutionId().equals(institutionId)) {
            throw new EntityNotFoundException("StaffMember", staffMemberId.toString());
        }

        return staff;
    }

    private void createAssignment(UUID staffMemberId, UUID groupId, String assignmentRole, UUID institutionId) {
        groupRepository.findById(groupId)
                .filter(g -> g.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new EntityNotFoundException("Group", groupId.toString()));

        if (!assignmentRepository.existsByStaffMemberIdAndGroupId(staffMemberId, groupId)) {
            StaffGroupAssignment assignment = StaffGroupAssignment.builder()
                    .staffMemberId(staffMemberId)
                    .groupId(groupId)
                    .assignmentRole(assignmentRole)
                    .active(true)
                    .build();
            assignmentRepository.save(assignment);
        }
    }

    private boolean isAssignableCategory(String category) {
        return "DOCENTE".equals(category) || "COORDINACION".equals(category) || "ESPECIALISTA".equals(category);
    }

    private String mapCategoryToRole(String systemRole, String category) {
        if (systemRole != null && !systemRole.isBlank()) {
            return systemRole;
        }
        return switch (category) {
            case "DOCENTE" -> "TEACHER";
            case "COORDINACION" -> "COORDINATOR";
            case "DIRECCION" -> "DIRECTOR";
            default -> "TEACHER";
        };
    }
}
