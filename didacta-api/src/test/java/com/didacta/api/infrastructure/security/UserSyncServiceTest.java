package com.didacta.api.infrastructure.security;

import com.didacta.api.application.port.output.UserRepositoryPort;
import com.didacta.api.domain.model.AppUser;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserSyncServiceTest {

    @Mock private UserRepositoryPort userRepository;

    @InjectMocks
    private UserSyncService service;

    @Test
    void syncUser_givenNewUser_shouldCreateNewUser() {
        when(userRepository.findByKeycloakUserId("kc-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(AppUser.class))).thenAnswer(inv -> {
            AppUser u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        service.syncUser("kc-123", "test@test.com", "Juan", "Perez");

        ArgumentCaptor<AppUser> captor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository).save(captor.capture());
        AppUser saved = captor.getValue();
        assertEquals("kc-123", saved.getKeycloakUserId());
        assertEquals("test@test.com", saved.getEmail());
        assertEquals("Juan", saved.getFirstName());
        assertEquals("Perez", saved.getLastName());
    }

    @Test
    void syncUser_givenExistingUserByKeycloakId_shouldUpdateIfChanged() {
        AppUser existing = new AppUser();
        existing.setId(UUID.randomUUID());
        existing.setKeycloakUserId("kc-123");
        existing.setEmail("old@test.com");
        existing.setFirstName("Old");
        existing.setLastName("Name");

        when(userRepository.findByKeycloakUserId("kc-123")).thenReturn(Optional.of(existing));
        when(userRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));

        service.syncUser("kc-123", "new@test.com", "New", "Name");

        verify(userRepository).save(existing);
        assertEquals("new@test.com", existing.getEmail());
        assertEquals("New", existing.getFirstName());
    }

    @Test
    void syncUser_givenExistingUserByKeycloakId_shouldNotSaveIfUnchanged() {
        AppUser existing = new AppUser();
        existing.setId(UUID.randomUUID());
        existing.setKeycloakUserId("kc-123");
        existing.setEmail("test@test.com");
        existing.setFirstName("Juan");
        existing.setLastName("Perez");

        when(userRepository.findByKeycloakUserId("kc-123")).thenReturn(Optional.of(existing));

        service.syncUser("kc-123", "test@test.com", "Juan", "Perez");

        verify(userRepository, never()).save(any());
    }

    @Test
    void syncUser_givenExistingEmailDifferentKeycloakId_shouldLinkUser() {
        AppUser existingByEmail = new AppUser();
        existingByEmail.setId(UUID.randomUUID());
        existingByEmail.setKeycloakUserId("old-kc-id");
        existingByEmail.setEmail("test@test.com");

        when(userRepository.findByKeycloakUserId("new-kc-id")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(existingByEmail));
        when(userRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));

        service.syncUser("new-kc-id", "test@test.com", "Juan", "Perez");

        verify(userRepository).save(existingByEmail);
        assertEquals("new-kc-id", existingByEmail.getKeycloakUserId());
        assertEquals("Juan", existingByEmail.getFirstName());
    }

    @Test
    void syncUser_givenRaceCondition_shouldHandleGracefully() {
        when(userRepository.findByKeycloakUserId("kc-123")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(AppUser.class))).thenThrow(new DataIntegrityViolationException("Duplicate"));

        assertDoesNotThrow(() -> service.syncUser("kc-123", "test@test.com", "Juan", "Perez"));
    }
}
