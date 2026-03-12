package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.output.CollaboratorRepositoryPort;
import com.didacta.api.application.port.output.GroupRepositoryPort;
import com.didacta.api.application.port.output.InstitutionRepositoryPort;
import com.didacta.api.application.port.output.TenantProviderPort;
import com.didacta.api.domain.exception.DomainException;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.CollaboratorPreUser;
import com.didacta.api.domain.model.GroupEntity;
import com.didacta.api.domain.model.Institution;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ManageCollaboratorsServiceTest {

    @Mock private CollaboratorRepositoryPort collaboratorRepository;
    @Mock private InstitutionRepositoryPort institutionRepository;
    @Mock private GroupRepositoryPort groupRepository;
    @Mock private TenantProviderPort tenantProvider;

    @InjectMocks
    private ManageCollaboratorsService service;

    private static final String KEYCLOAK_USER_ID = "kc-user-123";

    private Institution buildInstitution(UUID id) {
        Institution inst = new Institution();
        inst.setId(id);
        inst.setName("Colegio Test");
        return inst;
    }

    private OnboardingCommand.CreateCollaborators buildCommand(String email, String role) {
        OnboardingCommand.CollaboratorEntry entry = new OnboardingCommand.CollaboratorEntry();
        entry.setEmail(email);
        entry.setFullName("Test Collaborator");
        entry.setRole(role);

        OnboardingCommand.CreateCollaborators cmd = new OnboardingCommand.CreateCollaborators();
        cmd.setCollaborators(List.of(entry));
        return cmd;
    }

    @Test
    void create_givenNoTenantId_shouldThrowDomainException() {
        when(tenantProvider.getTenantUUID()).thenThrow(new DomainException("No X-Institution-Id header provided"));

        assertThrows(DomainException.class,
                () -> service.create(KEYCLOAK_USER_ID, buildCommand("test@test.com", "TEACHER")));
    }

    @Test
    void create_givenInstitutionNotFound_shouldThrowEntityNotFoundException() {
        UUID institutionId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(institutionRepository.findById(institutionId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.create(KEYCLOAK_USER_ID, buildCommand("test@test.com", "TEACHER")));
    }

    @Test
    void create_givenNewCollaborator_shouldSaveAndReturnResult() {
        UUID institutionId = UUID.randomUUID();
        Institution institution = buildInstitution(institutionId);

        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(institutionRepository.findById(institutionId)).thenReturn(Optional.of(institution));
        when(collaboratorRepository.existsByInstitutionIdAndEmail(eq(institutionId), eq("new@test.com"))).thenReturn(false);
        when(collaboratorRepository.save(any(CollaboratorPreUser.class))).thenAnswer(inv -> {
            CollaboratorPreUser c = inv.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        OnboardingResult.CollaboratorsCreated result = service.create(KEYCLOAK_USER_ID,
                buildCommand("new@test.com", "TEACHER"));

        assertEquals(1, result.getCreated());
        assertEquals("DONE", result.getNextStep());

        ArgumentCaptor<CollaboratorPreUser> captor = ArgumentCaptor.forClass(CollaboratorPreUser.class);
        verify(collaboratorRepository).save(captor.capture());
        CollaboratorPreUser saved = captor.getValue();
        assertEquals("new@test.com", saved.getEmail());
        assertEquals("TEACHER", saved.getRole());
        assertEquals("PENDING", saved.getStatus());
        assertEquals(institution, saved.getInstitution());
    }

    @Test
    void create_givenDuplicateEmail_shouldSkipAndNotSave() {
        UUID institutionId = UUID.randomUUID();
        Institution institution = buildInstitution(institutionId);

        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(institutionRepository.findById(institutionId)).thenReturn(Optional.of(institution));
        when(collaboratorRepository.existsByInstitutionIdAndEmail(eq(institutionId), eq("existing@test.com"))).thenReturn(true);

        OnboardingResult.CollaboratorsCreated result = service.create(KEYCLOAK_USER_ID,
                buildCommand("existing@test.com", "TEACHER"));

        assertEquals(0, result.getCreated());
        verify(collaboratorRepository, never()).save(any());
    }

    @Test
    void create_givenCollaboratorWithGroup_shouldAssignGroup() {
        UUID institutionId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        Institution institution = buildInstitution(institutionId);
        GroupEntity group = new GroupEntity();
        group.setId(groupId);
        group.setInstitution(institution);

        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(institutionRepository.findById(institutionId)).thenReturn(Optional.of(institution));
        when(collaboratorRepository.existsByInstitutionIdAndEmail(eq(institutionId), any())).thenReturn(false);
        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(collaboratorRepository.save(any(CollaboratorPreUser.class))).thenAnswer(inv -> {
            CollaboratorPreUser c = inv.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        OnboardingCommand.CollaboratorEntry entry = new OnboardingCommand.CollaboratorEntry();
        entry.setEmail("teacher@test.com");
        entry.setFullName("Teacher");
        entry.setRole("TEACHER");
        entry.setGroupId(groupId);

        OnboardingCommand.CreateCollaborators cmd = new OnboardingCommand.CreateCollaborators();
        cmd.setCollaborators(List.of(entry));

        service.create(KEYCLOAK_USER_ID, cmd);

        ArgumentCaptor<CollaboratorPreUser> captor = ArgumentCaptor.forClass(CollaboratorPreUser.class);
        verify(collaboratorRepository).save(captor.capture());
        assertEquals(group, captor.getValue().getGroup());
    }

    @Test
    void create_givenCollaboratorWithGroupFromDifferentInstitution_shouldSetGroupNull() {
        UUID institutionId = UUID.randomUUID();
        UUID otherInstitutionId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        Institution institution = buildInstitution(institutionId);
        Institution otherInstitution = buildInstitution(otherInstitutionId);
        GroupEntity foreignGroup = new GroupEntity();
        foreignGroup.setId(groupId);
        foreignGroup.setInstitution(otherInstitution);

        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(institutionRepository.findById(institutionId)).thenReturn(Optional.of(institution));
        when(collaboratorRepository.existsByInstitutionIdAndEmail(eq(institutionId), any())).thenReturn(false);
        when(groupRepository.findById(groupId)).thenReturn(Optional.of(foreignGroup));
        when(collaboratorRepository.save(any(CollaboratorPreUser.class))).thenAnswer(inv -> {
            CollaboratorPreUser c = inv.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        OnboardingCommand.CollaboratorEntry entry = new OnboardingCommand.CollaboratorEntry();
        entry.setEmail("teacher@test.com");
        entry.setFullName("Teacher");
        entry.setRole("TEACHER");
        entry.setGroupId(groupId);

        OnboardingCommand.CreateCollaborators cmd = new OnboardingCommand.CreateCollaborators();
        cmd.setCollaborators(List.of(entry));

        service.create(KEYCLOAK_USER_ID, cmd);

        ArgumentCaptor<CollaboratorPreUser> captor = ArgumentCaptor.forClass(CollaboratorPreUser.class);
        verify(collaboratorRepository).save(captor.capture());
        assertNull(captor.getValue().getGroup());
    }
}
