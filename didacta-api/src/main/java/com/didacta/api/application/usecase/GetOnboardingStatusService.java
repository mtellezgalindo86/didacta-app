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

        if (activeMembership.isPresent()) {
            hasInstitution = true;
            Institution institution = activeMembership.get().getInstitution();
            UUID institutionId = institution.getId();
            tenantDto = OnboardingMapper.toTenantDto(institution, activeMembership.get().getRole());

            List<GroupEntity> groups = groupRepository.findByInstitutionId(institutionId);
            hasGroup = !groups.isEmpty();

            if (hasGroup) {
                List<Student> students = studentRepository.findByInstitutionId(institutionId);
                hasStudents = !students.isEmpty();
                if (hasStudents) {
                    hasAttendance = attendanceRepository.existsByInstitutionId(institutionId);
                }
            }

            hasCollaborators = !collaboratorRepository.findByInstitutionId(institutionId).isEmpty();
        }

        String nextStep = resolveNextStep(hasInstitution, hasGroup, hasStudents, hasAttendance);

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
                .build();
    }

    private String resolveNextStep(boolean hasInstitution, boolean hasGroup, boolean hasStudents, boolean hasAttendance) {
        if (!hasInstitution) return "STEP_1";
        if (!hasGroup) return "STEP_2";
        if (!hasStudents) return "STEP_3";
        if (!hasAttendance) return "STEP_4";
        return "DONE";
    }
}
