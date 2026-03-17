package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.mapper.OnboardingMapper;
import com.didacta.api.application.port.input.GetOnboardingStatusUseCase;
import com.didacta.api.application.port.output.*;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetOnboardingStatusService implements GetOnboardingStatusUseCase {

    private final UserRepositoryPort userRepository;
    private final MembershipRepositoryPort membershipRepository;
    private final GroupRepositoryPort groupRepository;
    private final StudentRepositoryPort studentRepository;
    private final AttendanceRepositoryPort attendanceRepository;
    private final CollaboratorRepositoryPort collaboratorRepository;

    @Override
    @Transactional(readOnly = true)
    public OnboardingResult.MeResponse execute(String keycloakUserId) {
        AppUser user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new EntityNotFoundException("User", keycloakUserId));

        List<InstitutionUser> memberships = membershipRepository.findByUser(user);

        Optional<InstitutionUser> activeMembership = memberships.stream()
                .filter(m -> "ACTIVE".equals(m.getStatus()))
                .findFirst();

        OnboardingResult.TenantDto tenantDto = null;
        boolean hasInstitution = false;
        boolean hasGroup = false;
        boolean hasStudents = false;
        boolean hasAttendance = false;
        boolean hasCollaborators = false;

        int groupCount = 0;
        int studentCount = 0;
        int collaboratorCount = 0;

        if (activeMembership.isPresent()) {
            hasInstitution = true;
            Institution institution = activeMembership.get().getInstitution();
            UUID institutionId = institution.getId();
            tenantDto = OnboardingMapper.toTenantDto(institution, activeMembership.get().getRole());

            List<GroupEntity> groups = groupRepository.findByInstitutionId(institutionId);
            hasGroup = !groups.isEmpty();
            groupCount = groups.size();

            List<Student> students = studentRepository.findByInstitutionId(institutionId);
            hasStudents = !students.isEmpty();
            studentCount = students.size();

            if (hasStudents) {
                hasAttendance = attendanceRepository.existsByInstitutionId(institutionId);
            }

            List<CollaboratorPreUser> collaborators = collaboratorRepository.findByInstitutionId(institutionId);
            hasCollaborators = !collaborators.isEmpty();
            collaboratorCount = collaborators.size();
        }

        String nextStep = resolveNextStep(hasInstitution);
        String suggestedNextAction = resolveSuggestedAction(hasGroup, hasStudents, hasAttendance, hasCollaborators);

        return OnboardingResult.MeResponse.builder()
                .user(OnboardingMapper.toUserDto(user))
                .tenant(tenantDto)
                .onboarding(OnboardingResult.OnboardingStatus.builder()
                        .hasInstitution(hasInstitution)
                        .hasGroup(hasGroup)
                        .hasStudents(hasStudents)
                        .hasAttendance(hasAttendance)
                        .hasCollaborators(hasCollaborators)
                        .nextStep(nextStep)
                        .build())
                .setupProgress(OnboardingResult.SetupProgress.builder()
                        .hasGroup(hasGroup)
                        .hasStudents(hasStudents)
                        .hasAttendance(hasAttendance)
                        .hasCollaborators(hasCollaborators)
                        .groupCount(groupCount)
                        .studentCount(studentCount)
                        .collaboratorCount(collaboratorCount)
                        .suggestedNextAction(suggestedNextAction)
                        .build())
                .build();
    }

    private String resolveNextStep(boolean hasInstitution) {
        if (!hasInstitution) return "STEP_1";
        return "DONE";
    }

    private String resolveSuggestedAction(boolean hasGroup, boolean hasStudents, boolean hasAttendance, boolean hasCollaborators) {
        if (!hasGroup) return "CREATE_GROUP";
        if (!hasStudents) return "ADD_STUDENTS";
        if (!hasAttendance) return "TAKE_ATTENDANCE";
        if (!hasCollaborators) return "INVITE_TEAM";
        return "ALL_DONE";
    }
}
