package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.output.GroupRepositoryPort;
import com.didacta.api.application.port.output.StudentRepositoryPort;
import com.didacta.api.application.port.output.TenantProviderPort;
import com.didacta.api.domain.exception.DomainException;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.GroupEntity;
import com.didacta.api.domain.model.Institution;
import com.didacta.api.domain.model.Student;
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
class ManageStudentsServiceTest {

    @Mock private StudentRepositoryPort studentRepository;
    @Mock private GroupRepositoryPort groupRepository;
    @Mock private TenantProviderPort tenantProvider;

    @InjectMocks
    private ManageStudentsService service;

    private static final String KEYCLOAK_USER_ID = "kc-user-123";

    private GroupEntity buildGroup(UUID institutionId) {
        Institution institution = new Institution();
        institution.setId(institutionId);

        GroupEntity group = new GroupEntity();
        group.setId(UUID.randomUUID());
        group.setInstitution(institution);
        group.setName("1A");
        return group;
    }

    private OnboardingCommand.CreateStudents buildCommand(UUID groupId) {
        OnboardingCommand.StudentEntry entry1 = new OnboardingCommand.StudentEntry();
        entry1.setFirstName("Juan");
        entry1.setLastName("Perez");

        OnboardingCommand.StudentEntry entry2 = new OnboardingCommand.StudentEntry();
        entry2.setFirstName("Maria");
        entry2.setLastName("Lopez");

        OnboardingCommand.CreateStudents cmd = new OnboardingCommand.CreateStudents();
        cmd.setGroupId(groupId);
        cmd.setStudents(List.of(entry1, entry2));
        return cmd;
    }

    @Test
    void create_givenNoTenantId_shouldThrowDomainException() {
        // Given - tenantProvider throws DomainException
        when(tenantProvider.getTenantUUID()).thenThrow(new DomainException("No X-Institution-Id header provided"));

        OnboardingCommand.CreateStudents cmd = new OnboardingCommand.CreateStudents();
        cmd.setGroupId(UUID.randomUUID());
        cmd.setStudents(List.of());

        // When & Then
        assertThrows(DomainException.class,
                () -> service.create(KEYCLOAK_USER_ID, cmd));
    }

    @Test
    void create_givenGroupNotFound_shouldThrowEntityNotFoundException() {
        // Given
        UUID institutionId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        UUID groupId = UUID.randomUUID();

        when(groupRepository.findById(groupId)).thenReturn(Optional.empty());

        OnboardingCommand.CreateStudents cmd = buildCommand(groupId);

        // When & Then
        assertThrows(EntityNotFoundException.class,
                () -> service.create(KEYCLOAK_USER_ID, cmd));
    }

    @Test
    void create_givenGroupBelongsToDifferentInstitution_shouldThrowEntityNotFoundException() {
        // Given
        UUID institutionId = UUID.randomUUID();
        UUID otherInstitutionId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);

        GroupEntity group = buildGroup(otherInstitutionId);

        when(groupRepository.findById(group.getId())).thenReturn(Optional.of(group));

        OnboardingCommand.CreateStudents cmd = buildCommand(group.getId());

        // When & Then
        assertThrows(EntityNotFoundException.class,
                () -> service.create(KEYCLOAK_USER_ID, cmd));
    }

    @Test
    void create_givenValidStudents_shouldSaveAllAndReturnResult() {
        // Given
        UUID institutionId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        GroupEntity group = buildGroup(institutionId);

        when(groupRepository.findById(group.getId())).thenReturn(Optional.of(group));
        when(studentRepository.save(any(Student.class))).thenAnswer(inv -> {
            Student s = inv.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        OnboardingCommand.CreateStudents cmd = buildCommand(group.getId());

        // When
        OnboardingResult.StudentsCreated result = service.create(KEYCLOAK_USER_ID, cmd);

        // Then
        assertEquals(2, result.getCreated());
        assertEquals(2, result.getStudents().size());
        assertEquals("STEP_4", result.getNextStep());
        verify(studentRepository, times(2)).save(any(Student.class));
    }

    @Test
    void create_givenStudents_shouldTrimNamesAndSetDefaults() {
        // Given
        UUID institutionId = UUID.randomUUID();
        when(tenantProvider.getTenantUUID()).thenReturn(institutionId);
        GroupEntity group = buildGroup(institutionId);

        OnboardingCommand.StudentEntry entry = new OnboardingCommand.StudentEntry();
        entry.setFirstName("  Juan  ");
        entry.setLastName("  Perez  ");

        OnboardingCommand.CreateStudents cmd = new OnboardingCommand.CreateStudents();
        cmd.setGroupId(group.getId());
        cmd.setStudents(List.of(entry));

        when(groupRepository.findById(group.getId())).thenReturn(Optional.of(group));
        when(studentRepository.save(any(Student.class))).thenAnswer(inv -> {
            Student s = inv.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        // When
        service.create(KEYCLOAK_USER_ID, cmd);

        // Then
        ArgumentCaptor<Student> captor = ArgumentCaptor.forClass(Student.class);
        verify(studentRepository).save(captor.capture());
        Student saved = captor.getValue();
        assertEquals("Juan", saved.getFirstName());
        assertEquals("Perez", saved.getLastName());
        assertEquals("ACTIVE", saved.getStatus());
        assertEquals(institutionId, saved.getInstitutionId());
        assertEquals(group.getId(), saved.getGroupId());
        assertNotNull(saved.getEnrollmentDate());
    }

    @Test
    void listByInstitution_givenNoTenantId_shouldReturnEmptyList() {
        // Given - tenantProvider returns null
        when(tenantProvider.getTenantId()).thenReturn(null);

        // When
        List<OnboardingResult.StudentDto> result = service.listByInstitution();

        // Then
        assertTrue(result.isEmpty());
        verify(studentRepository, never()).findByInstitutionId(any());
    }

    @Test
    void listByInstitution_givenTenantWithStudents_shouldReturnStudentDtos() {
        // Given
        UUID institutionId = UUID.randomUUID();
        when(tenantProvider.getTenantId()).thenReturn(institutionId.toString());

        Student student = new Student();
        student.setId(UUID.randomUUID());
        student.setFirstName("Juan");
        student.setLastName("Perez");
        student.setStatus("ACTIVE");

        when(studentRepository.findByInstitutionId(institutionId)).thenReturn(List.of(student));

        // When
        List<OnboardingResult.StudentDto> result = service.listByInstitution();

        // Then
        assertEquals(1, result.size());
        assertEquals("Juan", result.get(0).getFirstName());
        assertEquals("Perez", result.get(0).getLastName());
    }
}
