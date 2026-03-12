package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.output.CampusRepositoryPort;
import com.didacta.api.application.port.output.GroupRepositoryPort;
import com.didacta.api.application.port.output.InstitutionRepositoryPort;
import com.didacta.api.application.port.output.TenantProviderPort;
import com.didacta.api.domain.exception.DomainException;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.Campus;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreateGroupServiceTest {

    @Mock private InstitutionRepositoryPort institutionRepository;
    @Mock private GroupRepositoryPort groupRepository;
    @Mock private CampusRepositoryPort campusRepository;
    @Mock private TenantProviderPort tenantProvider;

    @InjectMocks
    private CreateGroupService service;

    private static final String KEYCLOAK_USER_ID = "kc-user-123";

    private Institution buildInstitution(UUID id) {
        Institution inst = new Institution();
        inst.setId(id);
        inst.setName("Colegio Test");
        inst.setMainLevel("PRIMARY");
        return inst;
    }

    private Campus buildCampus(Institution institution) {
        Campus campus = new Campus();
        campus.setId(UUID.randomUUID());
        campus.setInstitution(institution);
        campus.setName("Sede Principal");
        return campus;
    }

    private OnboardingCommand.CreateGroup buildCommand() {
        OnboardingCommand.CreateGroup cmd = new OnboardingCommand.CreateGroup();
        cmd.setName("1A");
        cmd.setGradeLevel("FIRST");
        cmd.setShift("MATUTINO");
        return cmd;
    }

    @Test
    void execute_givenNoTenantId_shouldThrowDomainException() {
        // Given - tenantProvider throws DomainException
        when(tenantProvider.getTenantUUID()).thenThrow(new DomainException("No X-Institution-Id header provided"));

        // When & Then
        assertThrows(DomainException.class,
                () -> service.execute(KEYCLOAK_USER_ID, buildCommand()));
    }

    @Test
    void execute_givenInstitutionNotFound_shouldThrowEntityNotFoundException() {
        // Given
        UUID institutionId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        when(institutionRepository.findById(institutionId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(EntityNotFoundException.class,
                () -> service.execute(KEYCLOAK_USER_ID, buildCommand()));
    }

    @Test
    void execute_givenNewGroup_shouldCreateGroupWithDefaultCampus() {
        // Given
        UUID institutionId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        Institution institution = buildInstitution(institutionId);
        Campus campus = buildCampus(institution);
        OnboardingCommand.CreateGroup cmd = buildCommand();

        when(institutionRepository.findById(institutionId)).thenReturn(Optional.of(institution));
        when(groupRepository.findByInstitutionId(institutionId)).thenReturn(List.of());
        when(campusRepository.findFirstByInstitutionId(institutionId)).thenReturn(Optional.of(campus));
        when(groupRepository.save(any(GroupEntity.class))).thenAnswer(inv -> {
            GroupEntity g = inv.getArgument(0);
            g.setId(UUID.randomUUID());
            return g;
        });

        // When
        OnboardingResult.GroupCreated result = service.execute(KEYCLOAK_USER_ID, cmd);

        // Then
        assertNotNull(result);
        assertNotNull(result.getGroupId());
        assertEquals("STEP_3", result.getNextStep());

        ArgumentCaptor<GroupEntity> groupCaptor = ArgumentCaptor.forClass(GroupEntity.class);
        verify(groupRepository).save(groupCaptor.capture());
        GroupEntity savedGroup = groupCaptor.getValue();
        assertEquals("1A", savedGroup.getName());
        assertEquals("FIRST", savedGroup.getGradeLevel());
        assertEquals("MATUTINO", savedGroup.getShift());
        assertEquals(campus, savedGroup.getCampus());
        assertTrue(savedGroup.getActive());
    }

    @Test
    void execute_givenSpecificCampusId_shouldUseThatCampus() {
        // Given
        UUID institutionId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        Institution institution = buildInstitution(institutionId);
        Campus specificCampus = buildCampus(institution);
        OnboardingCommand.CreateGroup cmd = buildCommand();
        cmd.setCampusId(specificCampus.getId());

        when(institutionRepository.findById(institutionId)).thenReturn(Optional.of(institution));
        when(groupRepository.findByInstitutionId(institutionId)).thenReturn(List.of());
        when(campusRepository.findById(specificCampus.getId())).thenReturn(Optional.of(specificCampus));
        when(groupRepository.save(any(GroupEntity.class))).thenAnswer(inv -> {
            GroupEntity g = inv.getArgument(0);
            g.setId(UUID.randomUUID());
            return g;
        });

        // When
        OnboardingResult.GroupCreated result = service.execute(KEYCLOAK_USER_ID, cmd);

        // Then
        assertNotNull(result);
        ArgumentCaptor<GroupEntity> groupCaptor = ArgumentCaptor.forClass(GroupEntity.class);
        verify(groupRepository).save(groupCaptor.capture());
        assertEquals(specificCampus, groupCaptor.getValue().getCampus());
    }

    @Test
    void execute_givenCampusBelongsToDifferentInstitution_shouldThrowEntityNotFoundException() {
        // Given
        UUID institutionId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        Institution institution = buildInstitution(institutionId);

        Institution otherInstitution = buildInstitution(UUID.randomUUID());
        Campus foreignCampus = buildCampus(otherInstitution);

        OnboardingCommand.CreateGroup cmd = buildCommand();
        cmd.setCampusId(foreignCampus.getId());

        when(institutionRepository.findById(institutionId)).thenReturn(Optional.of(institution));
        when(groupRepository.findByInstitutionId(institutionId)).thenReturn(List.of());
        when(campusRepository.findById(foreignCampus.getId())).thenReturn(Optional.of(foreignCampus));

        // When & Then
        assertThrows(EntityNotFoundException.class,
                () -> service.execute(KEYCLOAK_USER_ID, cmd));
    }

    @Test
    void execute_givenDuplicateGroupName_shouldUpdateExistingGroup() {
        // Given
        UUID institutionId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        Institution institution = buildInstitution(institutionId);
        Campus campus = buildCampus(institution);

        GroupEntity existingGroup = new GroupEntity();
        existingGroup.setId(UUID.randomUUID());
        existingGroup.setInstitution(institution);
        existingGroup.setName("1A");
        existingGroup.setCampus(campus);
        existingGroup.setActive(true);

        OnboardingCommand.CreateGroup cmd = buildCommand();
        cmd.setGradeLevel("SECOND");
        cmd.setShift("VESPERTINO");

        when(institutionRepository.findById(institutionId)).thenReturn(Optional.of(institution));
        when(groupRepository.findByInstitutionId(institutionId)).thenReturn(List.of(existingGroup));
        when(campusRepository.findFirstByInstitutionId(institutionId)).thenReturn(Optional.of(campus));
        when(groupRepository.save(any(GroupEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        OnboardingResult.GroupCreated result = service.execute(KEYCLOAK_USER_ID, cmd);

        // Then
        assertEquals(existingGroup.getId(), result.getGroupId());
        assertEquals("SECOND", existingGroup.getGradeLevel());
        assertEquals("VESPERTINO", existingGroup.getShift());
    }
}
