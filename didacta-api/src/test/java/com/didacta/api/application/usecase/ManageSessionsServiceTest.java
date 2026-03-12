package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.output.GroupRepositoryPort;
import com.didacta.api.application.port.output.SessionRepositoryPort;
import com.didacta.api.application.port.output.TenantProviderPort;
import com.didacta.api.domain.exception.DomainException;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.GroupEntity;
import com.didacta.api.domain.model.Institution;
import com.didacta.api.domain.model.Session;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ManageSessionsServiceTest {

    @Mock private SessionRepositoryPort sessionRepository;
    @Mock private GroupRepositoryPort groupRepository;
    @Mock private TenantProviderPort tenantProvider;

    @InjectMocks
    private ManageSessionsService service;

    private Session buildSession(UUID id, UUID groupId) {
        Session session = new Session();
        session.setId(id);
        session.setGroupId(groupId);
        session.setTitle("Test Session");
        session.setNotes("Some notes");
        session.setStatus(Session.SessionStatus.DRAFT);
        session.setSessionType(Session.SessionType.CLASS);
        session.setSessionDate(LocalDate.of(2026, 3, 10));
        session.setSubject("Math");
        return session;
    }

    private GroupEntity buildGroup(UUID groupId, UUID institutionId) {
        Institution institution = new Institution();
        institution.setId(institutionId);
        GroupEntity group = new GroupEntity();
        group.setId(groupId);
        group.setInstitution(institution);
        group.setName("1A");
        return group;
    }

    private OnboardingCommand.CreateSession buildCommand(UUID groupId) {
        OnboardingCommand.CreateSession cmd = new OnboardingCommand.CreateSession();
        cmd.setGroupId(groupId);
        cmd.setTitle("New Session");
        cmd.setNotes("Notes");
        cmd.setSessionType("CLASS");
        cmd.setSessionDate(LocalDate.of(2026, 3, 15));
        cmd.setSubject("Science");
        return cmd;
    }

    @Test
    void create_givenNoTenant_shouldThrowDomainException() {
        when(tenantProvider.getTenantUUID()).thenThrow(new DomainException("No X-Institution-Id header provided"));
        OnboardingCommand.CreateSession cmd = buildCommand(UUID.randomUUID());

        assertThrows(DomainException.class, () -> service.create(cmd));
    }

    @Test
    void create_givenGroupNotInTenant_shouldThrowEntityNotFoundException() {
        UUID institutionId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(groupRepository.findById(groupId)).thenReturn(Optional.empty());

        OnboardingCommand.CreateSession cmd = buildCommand(groupId);

        assertThrows(EntityNotFoundException.class, () -> service.create(cmd));
    }

    @Test
    void create_givenGroupBelongsToDifferentInstitution_shouldThrowEntityNotFoundException() {
        UUID institutionId = UUID.randomUUID();
        UUID otherInstitutionId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(groupRepository.findById(groupId)).thenReturn(Optional.of(buildGroup(groupId, otherInstitutionId)));

        OnboardingCommand.CreateSession cmd = buildCommand(groupId);

        assertThrows(EntityNotFoundException.class, () -> service.create(cmd));
    }

    @Test
    void create_givenValidCommand_shouldSaveAndReturnDto() {
        UUID institutionId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(groupRepository.findById(groupId)).thenReturn(Optional.of(buildGroup(groupId, institutionId)));
        OnboardingCommand.CreateSession cmd = buildCommand(groupId);

        when(sessionRepository.save(any(Session.class))).thenAnswer(inv -> {
            Session s = inv.getArgument(0);
            s.setId(UUID.randomUUID());
            s.setStatus(Session.SessionStatus.DRAFT);
            return s;
        });

        OnboardingResult.SessionDto result = service.create(cmd);

        assertNotNull(result.getId());
        assertEquals(groupId, result.getGroupId());
        assertEquals("New Session", result.getTitle());
        assertEquals("Science", result.getSubject());

        ArgumentCaptor<Session> captor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository).save(captor.capture());
        assertEquals(Session.SessionType.CLASS, captor.getValue().getSessionType());
    }

    @Test
    void create_givenNullSessionType_shouldKeepDefaultFreeForm() {
        UUID institutionId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(groupRepository.findById(groupId)).thenReturn(Optional.of(buildGroup(groupId, institutionId)));
        OnboardingCommand.CreateSession cmd = buildCommand(groupId);
        cmd.setSessionType(null);

        when(sessionRepository.save(any(Session.class))).thenAnswer(inv -> {
            Session s = inv.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        service.create(cmd);

        ArgumentCaptor<Session> captor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository).save(captor.capture());
        assertEquals(Session.SessionType.FREE_FORM, captor.getValue().getSessionType());
    }

    @Test
    void listAll_shouldReturnAllSessionsAsDtos() {
        UUID groupId = UUID.randomUUID();
        Session session1 = buildSession(UUID.randomUUID(), groupId);
        Session session2 = buildSession(UUID.randomUUID(), groupId);
        session2.setTitle("Second Session");

        when(sessionRepository.findAll()).thenReturn(List.of(session1, session2));

        List<OnboardingResult.SessionDto> result = service.listAll();

        assertEquals(2, result.size());
        assertEquals("Test Session", result.get(0).getTitle());
        assertEquals("Second Session", result.get(1).getTitle());
    }

    @Test
    void findById_givenExistingId_shouldReturnDto() {
        UUID id = UUID.randomUUID();
        Session session = buildSession(id, UUID.randomUUID());

        when(sessionRepository.findById(id)).thenReturn(Optional.of(session));

        OnboardingResult.SessionDto result = service.findById(id);

        assertEquals(id, result.getId());
        assertEquals("DRAFT", result.getStatus());
        assertEquals("CLASS", result.getSessionType());
    }

    @Test
    void findById_givenNonExistingId_shouldThrowEntityNotFoundException() {
        UUID id = UUID.randomUUID();
        when(sessionRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.findById(id));
    }

    @Test
    void complete_givenExistingId_shouldSetStatusCompletedAndReturnDto() {
        UUID id = UUID.randomUUID();
        Session session = buildSession(id, UUID.randomUUID());

        when(sessionRepository.findById(id)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenAnswer(inv -> inv.getArgument(0));

        OnboardingResult.SessionDto result = service.complete(id);

        assertEquals("COMPLETED", result.getStatus());
        verify(sessionRepository).save(session);
    }

    @Test
    void complete_givenNonExistingId_shouldThrowEntityNotFoundException() {
        UUID id = UUID.randomUUID();
        when(sessionRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.complete(id));
    }
}
