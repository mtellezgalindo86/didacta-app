package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.output.*;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.*;
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
class CreateInstitutionServiceTest {

    @Mock private UserRepositoryPort userRepository;
    @Mock private InstitutionRepositoryPort institutionRepository;
    @Mock private MembershipRepositoryPort membershipRepository;
    @Mock private CampusRepositoryPort campusRepository;
    @Mock private SchoolYearRepositoryPort schoolYearRepository;

    @InjectMocks
    private CreateInstitutionService service;

    private static final String KEYCLOAK_USER_ID = "kc-user-123";

    private AppUser buildUser() {
        AppUser user = new AppUser();
        user.setId(UUID.randomUUID());
        user.setKeycloakUserId(KEYCLOAK_USER_ID);
        user.setEmail("test@didacta.com");
        return user;
    }

    private OnboardingCommand.CreateInstitution buildCommand() {
        OnboardingCommand.CreateInstitution cmd = new OnboardingCommand.CreateInstitution();
        cmd.setName("Colegio ABC");
        cmd.setMainLevel("PRIMARY");
        cmd.setCountry("MX");
        cmd.setTimezone("America/Mexico_City");
        cmd.setRole("OWNER");
        cmd.setHasMultipleCampuses(false);
        return cmd;
    }

    @Test
    void execute_givenUserNotFound_shouldThrowEntityNotFoundException() {
        // Given
        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(EntityNotFoundException.class,
                () -> service.execute(KEYCLOAK_USER_ID, buildCommand()));
    }

    @Test
    void execute_givenNewUser_shouldCreateInstitutionCampusMembershipAndSchoolYear() {
        // Given
        AppUser user = buildUser();
        OnboardingCommand.CreateInstitution cmd = buildCommand();

        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of());
        when(institutionRepository.save(any(Institution.class))).thenAnswer(inv -> {
            Institution i = inv.getArgument(0);
            i.setId(UUID.randomUUID());
            return i;
        });
        when(campusRepository.save(any(Campus.class))).thenAnswer(inv -> inv.getArgument(0));
        when(membershipRepository.save(any(InstitutionUser.class))).thenAnswer(inv -> inv.getArgument(0));
        when(schoolYearRepository.save(any(SchoolYear.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        OnboardingResult.InstitutionCreated result = service.execute(KEYCLOAK_USER_ID, cmd);

        // Then
        assertNotNull(result);
        assertNotNull(result.getInstitutionId());
        assertEquals("STEP_2", result.getNextStep());

        verify(institutionRepository).save(any(Institution.class));
        verify(campusRepository).save(any(Campus.class));
        verify(membershipRepository).save(any(InstitutionUser.class));
        verify(schoolYearRepository).save(any(SchoolYear.class));
    }

    @Test
    void execute_givenNewUserWithoutMultipleCampuses_shouldCreateDefaultCampusName() {
        // Given
        AppUser user = buildUser();
        OnboardingCommand.CreateInstitution cmd = buildCommand();
        cmd.setHasMultipleCampuses(false);

        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of());
        when(institutionRepository.save(any(Institution.class))).thenAnswer(inv -> {
            Institution i = inv.getArgument(0);
            i.setId(UUID.randomUUID());
            return i;
        });
        when(campusRepository.save(any(Campus.class))).thenAnswer(inv -> inv.getArgument(0));
        when(membershipRepository.save(any(InstitutionUser.class))).thenAnswer(inv -> inv.getArgument(0));
        when(schoolYearRepository.save(any(SchoolYear.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        service.execute(KEYCLOAK_USER_ID, cmd);

        // Then
        ArgumentCaptor<Campus> campusCaptor = ArgumentCaptor.forClass(Campus.class);
        verify(campusRepository).save(campusCaptor.capture());
        assertEquals("Sede Principal", campusCaptor.getValue().getName());
    }

    @Test
    void execute_givenNewUserWithMultipleCampuses_shouldUseCampusName() {
        // Given
        AppUser user = buildUser();
        OnboardingCommand.CreateInstitution cmd = buildCommand();
        cmd.setHasMultipleCampuses(true);
        cmd.setCampusName("Campus Norte");

        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of());
        when(institutionRepository.save(any(Institution.class))).thenAnswer(inv -> {
            Institution i = inv.getArgument(0);
            i.setId(UUID.randomUUID());
            return i;
        });
        when(campusRepository.save(any(Campus.class))).thenAnswer(inv -> inv.getArgument(0));
        when(membershipRepository.save(any(InstitutionUser.class))).thenAnswer(inv -> inv.getArgument(0));
        when(schoolYearRepository.save(any(SchoolYear.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        service.execute(KEYCLOAK_USER_ID, cmd);

        // Then
        ArgumentCaptor<Campus> campusCaptor = ArgumentCaptor.forClass(Campus.class);
        verify(campusRepository).save(campusCaptor.capture());
        assertEquals("Campus Norte", campusCaptor.getValue().getName());
    }

    @Test
    void execute_givenExistingMembership_shouldUpdateInstitution() {
        // Given
        AppUser user = buildUser();
        Institution existingInst = new Institution();
        existingInst.setId(UUID.randomUUID());
        existingInst.setName("Old Name");
        existingInst.setMainLevel("SECONDARY");

        InstitutionUser existingMembership = new InstitutionUser();
        existingMembership.setId(UUID.randomUUID());
        existingMembership.setInstitution(existingInst);
        existingMembership.setUser(user);
        existingMembership.setRole("TEACHER");
        existingMembership.setStatus("ACTIVE");

        OnboardingCommand.CreateInstitution cmd = buildCommand();

        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of(existingMembership));
        when(institutionRepository.save(any(Institution.class))).thenAnswer(inv -> inv.getArgument(0));
        when(membershipRepository.save(any(InstitutionUser.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        OnboardingResult.InstitutionCreated result = service.execute(KEYCLOAK_USER_ID, cmd);

        // Then
        assertEquals(existingInst.getId(), result.getInstitutionId());
        assertEquals("Colegio ABC", existingInst.getName());
        assertEquals("PRIMARY", existingInst.getMainLevel());
        assertEquals("OWNER", existingMembership.getRole());

        // Should NOT create new school year when updating
        verify(schoolYearRepository, never()).save(any());
    }

    @Test
    void execute_givenNewInstitution_shouldSetCreatedByUser() {
        // Given
        AppUser user = buildUser();
        OnboardingCommand.CreateInstitution cmd = buildCommand();

        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of());
        when(institutionRepository.save(any(Institution.class))).thenAnswer(inv -> {
            Institution i = inv.getArgument(0);
            i.setId(UUID.randomUUID());
            return i;
        });
        when(campusRepository.save(any(Campus.class))).thenAnswer(inv -> inv.getArgument(0));
        when(membershipRepository.save(any(InstitutionUser.class))).thenAnswer(inv -> inv.getArgument(0));
        when(schoolYearRepository.save(any(SchoolYear.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        service.execute(KEYCLOAK_USER_ID, cmd);

        // Then
        ArgumentCaptor<Institution> instCaptor = ArgumentCaptor.forClass(Institution.class);
        verify(institutionRepository).save(instCaptor.capture());
        assertEquals(user, instCaptor.getValue().getCreatedByUser());
    }

    @Test
    void execute_givenNewInstitution_shouldCreateMembershipWithActiveStatus() {
        // Given
        AppUser user = buildUser();
        OnboardingCommand.CreateInstitution cmd = buildCommand();

        when(userRepository.findByKeycloakUserId(KEYCLOAK_USER_ID)).thenReturn(Optional.of(user));
        when(membershipRepository.findByUser(user)).thenReturn(List.of());
        when(institutionRepository.save(any(Institution.class))).thenAnswer(inv -> {
            Institution i = inv.getArgument(0);
            i.setId(UUID.randomUUID());
            return i;
        });
        when(campusRepository.save(any(Campus.class))).thenAnswer(inv -> inv.getArgument(0));
        when(membershipRepository.save(any(InstitutionUser.class))).thenAnswer(inv -> inv.getArgument(0));
        when(schoolYearRepository.save(any(SchoolYear.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        service.execute(KEYCLOAK_USER_ID, cmd);

        // Then
        ArgumentCaptor<InstitutionUser> membershipCaptor = ArgumentCaptor.forClass(InstitutionUser.class);
        verify(membershipRepository).save(membershipCaptor.capture());
        assertEquals("ACTIVE", membershipCaptor.getValue().getStatus());
        assertEquals("OWNER", membershipCaptor.getValue().getRole());
    }
}
