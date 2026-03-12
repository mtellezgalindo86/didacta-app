package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.output.*;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GetOnboardingStatusServiceTest {

    @Mock private UserRepositoryPort userRepository;
    @Mock private MembershipRepositoryPort membershipRepository;
    @Mock private GroupRepositoryPort groupRepository;
    @Mock private StudentRepositoryPort studentRepository;
    @Mock private AttendanceRepositoryPort attendanceRepository;
    @Mock private CollaboratorRepositoryPort collaboratorRepository;

    @InjectMocks
    private GetOnboardingStatusService service;

    private static final String KEYCLOAK_USER_ID = "kc-user-123";

    // --- Helper builders ---

    private AppUser buildUser() {
        AppUser user = new AppUser();
        user.setId(UUID.randomUUID());
        user.setKeycloakUserId(KEYCLOAK_USER_ID);
        user.setEmail("test@didacta.com");
        user.setFirstName("Test");
        user.setLastName("User");
        return user;
    }

    private Institution buildInstitution() {
        Institution inst = new Institution();
        inst.setId(UUID.randomUUID());
        inst.setName("Colegio Test");
        inst.setMainLevel("PRIMARY");
        return inst;
    }

    private InstitutionUser buildMembership(Institution institution, AppUser user, String status) {
        InstitutionUser m = new InstitutionUser();
        m.setId(UUID.randomUUID());
        m.setInstitution(institution);
        m.setUser(user);
        m.setRole("OWNER");
        m.setStatus(status);
        return m;
    }

    // --- Tests ---

    @Test
    void execute_givenUserNotFound_shouldThrowEntityNotFoundException() {
        // Given
        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.empty());

        // When & Then
        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class,
                () -> service.execute(KEYCLOAK_USER_ID));
        assertTrue(ex.getMessage().contains("User"));
    }

    @Test
    void execute_givenNoMemberships_shouldReturnStep0() {
        // Given
        AppUser user = buildUser();
        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of());

        // When
        OnboardingResult.MeResponse result = service.execute(KEYCLOAK_USER_ID);

        // Then
        assertNotNull(result);
        assertNotNull(result.getUser());
        assertEquals("test@didacta.com", result.getUser().getEmail());
        assertNull(result.getTenant());
        assertFalse(result.getOnboarding().isHasInstitution());
        assertFalse(result.getOnboarding().isHasGroup());
        assertFalse(result.getOnboarding().isHasStudents());
        assertFalse(result.getOnboarding().isHasAttendance());
        assertFalse(result.getOnboarding().isHasCollaborators());
        assertEquals("STEP_0", result.getOnboarding().getNextStep());
    }

    @Test
    void execute_givenPendingMembershipOnly_shouldReturnStep0() {
        // Given
        AppUser user = buildUser();
        Institution institution = buildInstitution();
        InstitutionUser membership = buildMembership(institution, user, "PENDING");

        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of(membership));

        // When
        OnboardingResult.MeResponse result = service.execute(KEYCLOAK_USER_ID);

        // Then
        assertFalse(result.getOnboarding().isHasInstitution());
        assertEquals("STEP_0", result.getOnboarding().getNextStep());
        assertNull(result.getTenant());
    }

    @Test
    void execute_givenInstitutionButNoGroups_shouldReturnStep2() {
        // Given
        AppUser user = buildUser();
        Institution institution = buildInstitution();
        InstitutionUser membership = buildMembership(institution, user, "ACTIVE");

        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of(membership));
        when(groupRepository.findByInstitutionId(institution.getId())).thenReturn(List.of());
        when(collaboratorRepository.findByInstitutionId(institution.getId())).thenReturn(List.of());

        // When
        OnboardingResult.MeResponse result = service.execute(KEYCLOAK_USER_ID);

        // Then
        assertTrue(result.getOnboarding().isHasInstitution());
        assertFalse(result.getOnboarding().isHasGroup());
        assertEquals("STEP_2", result.getOnboarding().getNextStep());
        assertNotNull(result.getTenant());
        assertEquals(institution.getId(), result.getTenant().getInstitutionId());
        assertEquals("OWNER", result.getTenant().getRole());
    }

    @Test
    void execute_givenGroupsButNoStudents_shouldReturnStep3() {
        // Given
        AppUser user = buildUser();
        Institution institution = buildInstitution();
        InstitutionUser membership = buildMembership(institution, user, "ACTIVE");

        GroupEntity group = new GroupEntity();
        group.setId(UUID.randomUUID());
        group.setInstitution(institution);
        group.setName("1A");

        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of(membership));
        when(groupRepository.findByInstitutionId(institution.getId())).thenReturn(List.of(group));
        when(studentRepository.findByInstitutionId(institution.getId())).thenReturn(List.of());
        when(collaboratorRepository.findByInstitutionId(institution.getId())).thenReturn(List.of());

        // When
        OnboardingResult.MeResponse result = service.execute(KEYCLOAK_USER_ID);

        // Then
        assertTrue(result.getOnboarding().isHasGroup());
        assertFalse(result.getOnboarding().isHasStudents());
        assertEquals("STEP_3", result.getOnboarding().getNextStep());
    }

    @Test
    void execute_givenStudentsButNoAttendance_shouldReturnStep4() {
        // Given
        AppUser user = buildUser();
        Institution institution = buildInstitution();
        InstitutionUser membership = buildMembership(institution, user, "ACTIVE");

        GroupEntity group = new GroupEntity();
        group.setId(UUID.randomUUID());
        group.setInstitution(institution);
        group.setName("1A");

        Student student = new Student();
        student.setId(UUID.randomUUID());
        student.setFirstName("Juan");
        student.setLastName("Perez");

        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of(membership));
        when(groupRepository.findByInstitutionId(institution.getId())).thenReturn(List.of(group));
        when(studentRepository.findByInstitutionId(institution.getId())).thenReturn(List.of(student));
        when(attendanceRepository.existsByInstitutionId(institution.getId())).thenReturn(false);
        when(collaboratorRepository.findByInstitutionId(institution.getId())).thenReturn(List.of());

        // When
        OnboardingResult.MeResponse result = service.execute(KEYCLOAK_USER_ID);

        // Then
        assertTrue(result.getOnboarding().isHasStudents());
        assertFalse(result.getOnboarding().isHasAttendance());
        assertEquals("STEP_4", result.getOnboarding().getNextStep());
    }

    @Test
    void execute_givenAllStepsComplete_shouldReturnDone() {
        // Given
        AppUser user = buildUser();
        Institution institution = buildInstitution();
        InstitutionUser membership = buildMembership(institution, user, "ACTIVE");

        GroupEntity group = new GroupEntity();
        group.setId(UUID.randomUUID());
        group.setInstitution(institution);
        group.setName("1A");

        Student student = new Student();
        student.setId(UUID.randomUUID());
        student.setFirstName("Juan");
        student.setLastName("Perez");

        CollaboratorPreUser collab = new CollaboratorPreUser();

        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of(membership));
        when(groupRepository.findByInstitutionId(institution.getId())).thenReturn(List.of(group));
        when(studentRepository.findByInstitutionId(institution.getId())).thenReturn(List.of(student));
        when(attendanceRepository.existsByInstitutionId(institution.getId())).thenReturn(true);
        when(collaboratorRepository.findByInstitutionId(institution.getId())).thenReturn(List.of(collab));

        // When
        OnboardingResult.MeResponse result = service.execute(KEYCLOAK_USER_ID);

        // Then
        assertTrue(result.getOnboarding().isHasInstitution());
        assertTrue(result.getOnboarding().isHasGroup());
        assertTrue(result.getOnboarding().isHasStudents());
        assertTrue(result.getOnboarding().isHasAttendance());
        assertTrue(result.getOnboarding().isHasCollaborators());
        assertEquals("DONE", result.getOnboarding().getNextStep());
    }

    @Test
    void execute_givenNoGroupsExist_shouldNotQueryStudentsOrAttendance() {
        // Given
        AppUser user = buildUser();
        Institution institution = buildInstitution();
        InstitutionUser membership = buildMembership(institution, user, "ACTIVE");

        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of(membership));
        when(groupRepository.findByInstitutionId(institution.getId())).thenReturn(List.of());
        when(collaboratorRepository.findByInstitutionId(institution.getId())).thenReturn(List.of());

        // When
        service.execute(KEYCLOAK_USER_ID);

        // Then - verify no unnecessary queries
        verify(studentRepository, never()).findByInstitutionId(any());
        verify(attendanceRepository, never()).existsByInstitutionId(any());
    }
}
