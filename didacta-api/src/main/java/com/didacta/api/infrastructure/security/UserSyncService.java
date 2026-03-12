package com.didacta.api.infrastructure.security;

import com.didacta.api.application.port.output.UserRepositoryPort;
import com.didacta.api.domain.model.AppUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSyncService {

    private final UserRepositoryPort userRepository;

    @Transactional
    public void syncUser(String keycloakUserId, String email, String firstName, String lastName) {
        Optional<AppUser> optionalUser = userRepository.findByKeycloakUserId(keycloakUserId);

        if (optionalUser.isPresent()) {
            AppUser user = optionalUser.get();
            boolean changed = false;
            if (!email.equals(user.getEmail())) {
                user.setEmail(email);
                changed = true;
            }
            if (firstName != null && !firstName.equals(user.getFirstName())) {
                user.setFirstName(firstName);
                changed = true;
            }
            if (lastName != null && !lastName.equals(user.getLastName())) {
                user.setLastName(lastName);
                changed = true;
            }
            if (changed) {
                userRepository.save(user);
                log.debug("Updated user: {}", email);
            }
        } else {
            Optional<AppUser> byEmail = userRepository.findByEmail(email);
            if (byEmail.isPresent()) {
                AppUser user = byEmail.get();
                user.setKeycloakUserId(keycloakUserId);
                user.setFirstName(firstName);
                user.setLastName(lastName);
                userRepository.save(user);
                log.info("Linked existing email to new Keycloak ID: {}", email);
            } else {
                AppUser user = new AppUser();
                user.setKeycloakUserId(keycloakUserId);
                user.setEmail(email);
                user.setFirstName(firstName);
                user.setLastName(lastName);
                try {
                    userRepository.save(user);
                    log.info("Created new user: {}", email);
                } catch (org.springframework.dao.DataIntegrityViolationException e) {
                    log.warn("Race condition detected: User {} already created by another request. Ignoring.", email);
                }
            }
        }
    }
}
