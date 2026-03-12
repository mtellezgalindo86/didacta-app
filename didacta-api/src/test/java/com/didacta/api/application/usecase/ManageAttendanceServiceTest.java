package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.output.*;
import com.didacta.api.domain.exception.DomainException;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ManageAttendanceServiceTest {

    @Mock private AttendanceRepositoryPort attendanceRepository;
    @Mock private SessionRepositoryPort sessionRepository;
    @Mock private UserRepositoryPort userRepository;
    @Mock private GroupRepositoryPort groupRepository;
    @Mock private StudentRepositoryPort studentRepository;
    @Mock private TenantProviderPort tenantProvider;

    @InjectMocks
    private ManageAttendanceService service;

    private static final String KEYCLOAK_USER_ID = "kc-user-123";

    private AppUser buildUser() {
        AppUser user = new AppUser();
        user.setId(UUID.randomUUID());
        user.setKeycloakUserId(KEYCLOAK_USER_ID);
        user.setEmail("test@didacta.com");
        return user;
    }

    private GroupEntity buildGroup(UUID institutionId, UUID groupId) {
        Institution institution = new Institution();
        institution.setId(institutionId);
        GroupEntity group = new GroupEntity();
        group.setId(groupId);
        group.setInstitution(institution);
        group.setName("1A");
        return group;
    }

    private OnboardingCommand.CreateAttendance buildCommand(UUID groupId, UUID studentId1, UUID studentId2) {
        OnboardingCommand.AttendanceEntry entry1 = new OnboardingCommand.AttendanceEntry();
        entry1.setStudentId(studentId1);
        entry1.setStatus("PRESENT");

        OnboardingCommand.AttendanceEntry entry2 = new OnboardingCommand.AttendanceEntry();
        entry2.setStudentId(studentId2);
        entry2.setStatus("ABSENT");

        OnboardingCommand.CreateAttendance cmd = new OnboardingCommand.CreateAttendance();
        cmd.setGroupId(groupId);
        cmd.setDate(LocalDate.of(2026, 3, 10));
        cmd.setEntries(List.of(entry1, entry2));
        return cmd;
    }

    private void setupHappyPath(UUID institutionId, UUID groupId, UUID studentId1, UUID studentId2, AppUser user) {
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(groupRepository.findById(groupId)).thenReturn(Optional.of(buildGroup(institutionId, groupId)));
        when(studentRepository.existsByIdAndInstitutionId(eq(studentId1), eq(institutionId))).thenReturn(true);
        when(studentRepository.existsByIdAndInstitutionId(eq(studentId2), eq(institutionId))).thenReturn(true);
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> {
            Attendance a = inv.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });
        when(sessionRepository.save(any(Session.class))).thenAnswer(inv -> {
            Session s = inv.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });
    }

    @Test
    void create_givenNoTenantId_shouldThrowDomainException() {
        when(tenantProvider.getTenantUUID()).thenThrow(new DomainException("No X-Institution-Id header provided"));
        OnboardingCommand.CreateAttendance cmd = buildCommand(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());

        assertThrows(DomainException.class, () -> service.create(KEYCLOAK_USER_ID, cmd));
    }

    @Test
    void create_givenUserNotFound_shouldThrowEntityNotFoundException() {
        UUID institutionId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.empty());

        OnboardingCommand.CreateAttendance cmd = buildCommand(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());

        assertThrows(EntityNotFoundException.class, () -> service.create(KEYCLOAK_USER_ID, cmd));
    }

    @Test
    void create_givenGroupNotInInstitution_shouldThrowEntityNotFoundException() {
        UUID institutionId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        AppUser user = buildUser();

        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(groupRepository.findById(groupId)).thenReturn(Optional.empty());

        OnboardingCommand.CreateAttendance cmd = buildCommand(groupId, UUID.randomUUID(), UUID.randomUUID());

        assertThrows(EntityNotFoundException.class, () -> service.create(KEYCLOAK_USER_ID, cmd));
    }

    @Test
    void create_givenStudentNotInInstitution_shouldThrowEntityNotFoundException() {
        UUID institutionId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        UUID validStudentId = UUID.randomUUID();
        UUID foreignStudentId = UUID.randomUUID();
        AppUser user = buildUser();

        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(groupRepository.findById(groupId)).thenReturn(Optional.of(buildGroup(institutionId, groupId)));
        when(studentRepository.existsByIdAndInstitutionId(validStudentId, institutionId)).thenReturn(true);
        when(studentRepository.existsByIdAndInstitutionId(foreignStudentId, institutionId)).thenReturn(false);

        OnboardingCommand.CreateAttendance cmd = buildCommand(groupId, validStudentId, foreignStudentId);

        assertThrows(EntityNotFoundException.class, () -> service.create(KEYCLOAK_USER_ID, cmd));
    }

    @Test
    void create_givenValidEntries_shouldSaveAttendanceAndCreateSession() {
        UUID institutionId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        UUID studentId1 = UUID.randomUUID();
        UUID studentId2 = UUID.randomUUID();
        AppUser user = buildUser();
        setupHappyPath(institutionId, groupId, studentId1, studentId2, user);

        OnboardingCommand.CreateAttendance cmd = buildCommand(groupId, studentId1, studentId2);
        OnboardingResult.AttendanceCreated result = service.create(KEYCLOAK_USER_ID, cmd);

        assertEquals(2, result.getRecorded());
        assertNotNull(result.getSessionId());
        assertEquals("STEP_5", result.getNextStep());
        verify(attendanceRepository, times(2)).save(any(Attendance.class));
        verify(sessionRepository).save(any(Session.class));
    }

    @Test
    void create_givenValidEntries_shouldSetCorrectAttendanceFields() {
        UUID institutionId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        UUID studentId1 = UUID.randomUUID();
        UUID studentId2 = UUID.randomUUID();
        AppUser user = buildUser();
        setupHappyPath(institutionId, groupId, studentId1, studentId2, user);

        OnboardingCommand.CreateAttendance cmd = buildCommand(groupId, studentId1, studentId2);
        service.create(KEYCLOAK_USER_ID, cmd);

        ArgumentCaptor<Attendance> attCaptor = ArgumentCaptor.forClass(Attendance.class);
        verify(attendanceRepository, times(2)).save(attCaptor.capture());

        List<Attendance> saved = attCaptor.getAllValues();
        Attendance first = saved.get(0);
        assertEquals(groupId, first.getGroupId());
        assertEquals(cmd.getDate(), first.getAttendanceDate());
        assertEquals(AttendanceStatus.PRESENT, first.getStatus());
        assertEquals(user.getId(), first.getRecordedBy());
        assertEquals(institutionId, first.getInstitutionId());

        Attendance second = saved.get(1);
        assertEquals(AttendanceStatus.ABSENT, second.getStatus());
    }

    @Test
    void create_givenValidEntries_shouldCreateDailyReportSession() {
        UUID institutionId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        UUID studentId1 = UUID.randomUUID();
        UUID studentId2 = UUID.randomUUID();
        AppUser user = buildUser();
        setupHappyPath(institutionId, groupId, studentId1, studentId2, user);

        OnboardingCommand.CreateAttendance cmd = buildCommand(groupId, studentId1, studentId2);
        service.create(KEYCLOAK_USER_ID, cmd);

        ArgumentCaptor<Session> sessionCaptor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository).save(sessionCaptor.capture());
        Session session = sessionCaptor.getValue();
        assertEquals(groupId, session.getGroupId());
        assertEquals(Session.SessionType.DAILY_REPORT, session.getSessionType());
        assertEquals(Session.SessionStatus.COMPLETED, session.getStatus());
        assertEquals(cmd.getDate(), session.getSessionDate());
        assertEquals(user.getId(), session.getFacilitatorId());
        assertNotNull(session.getCompletedAt());
        assertTrue(session.getTitle().contains(cmd.getDate().toString()));
    }

    @Test
    void create_givenInvalidAttendanceStatus_shouldThrowIllegalArgumentException() {
        UUID institutionId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        AppUser user = buildUser();

        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(groupRepository.findById(groupId)).thenReturn(Optional.of(buildGroup(institutionId, groupId)));
        when(studentRepository.existsByIdAndInstitutionId(studentId, institutionId)).thenReturn(true);

        OnboardingCommand.AttendanceEntry entry = new OnboardingCommand.AttendanceEntry();
        entry.setStudentId(studentId);
        entry.setStatus("INVALID_STATUS");

        OnboardingCommand.CreateAttendance cmd = new OnboardingCommand.CreateAttendance();
        cmd.setGroupId(groupId);
        cmd.setDate(LocalDate.of(2026, 3, 10));
        cmd.setEntries(List.of(entry));

        assertThrows(IllegalArgumentException.class, () -> service.create(KEYCLOAK_USER_ID, cmd));
    }
}
