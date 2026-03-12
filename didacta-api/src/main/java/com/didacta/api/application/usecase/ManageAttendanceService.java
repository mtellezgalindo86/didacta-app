package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.input.ManageAttendanceUseCase;
import com.didacta.api.application.port.output.*;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.Attendance;
import com.didacta.api.domain.model.AttendanceStatus;
import com.didacta.api.domain.model.AppUser;
import com.didacta.api.domain.model.GroupEntity;
import com.didacta.api.domain.model.Session;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ManageAttendanceService implements ManageAttendanceUseCase {

    private final AttendanceRepositoryPort attendanceRepository;
    private final SessionRepositoryPort sessionRepository;
    private final UserRepositoryPort userRepository;
    private final GroupRepositoryPort groupRepository;
    private final StudentRepositoryPort studentRepository;
    private final TenantProviderPort tenantProvider;

    @Override
    @Transactional
    public OnboardingResult.AttendanceCreated create(String keycloakUserId, OnboardingCommand.CreateAttendance command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        AppUser user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new EntityNotFoundException("User", keycloakUserId));

        // Validate group belongs to this institution
        GroupEntity group = groupRepository.findById(command.getGroupId())
                .filter(g -> g.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new EntityNotFoundException("Group", command.getGroupId().toString()));

        // Validate all student IDs belong to this institution
        for (OnboardingCommand.AttendanceEntry entry : command.getEntries()) {
            if (!studentRepository.existsByIdAndInstitutionId(entry.getStudentId(), institutionId)) {
                throw new EntityNotFoundException("Student", entry.getStudentId().toString());
            }
        }

        int recorded = 0;
        for (OnboardingCommand.AttendanceEntry entry : command.getEntries()) {
            Attendance att = new Attendance();
            att.setStudentId(entry.getStudentId());
            att.setGroupId(group.getId());
            att.setAttendanceDate(command.getDate());
            att.setStatus(AttendanceStatus.valueOf(entry.getStatus()));
            att.setRecordedBy(user.getId());
            att.setInstitutionId(institutionId);
            attendanceRepository.save(att);
            recorded++;
        }

        Session session = new Session();
        session.setGroupId(group.getId());
        session.setTitle("Asistencia del " + command.getDate().toString());
        session.setSessionType(Session.SessionType.DAILY_REPORT);
        session.setStatus(Session.SessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        session.setSessionDate(command.getDate());
        session.setFacilitatorId(user.getId());
        sessionRepository.save(session);

        return OnboardingResult.AttendanceCreated.builder()
                .recorded(recorded)
                .sessionId(session.getId())
                .nextStep("STEP_5")
                .build();
    }
}
