package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.AppUser;

import java.util.Optional;
import java.util.UUID;

public interface UserRepositoryPort {
    Optional<AppUser> findByKeycloakUserId(String keycloakUserId);
    Optional<AppUser> findByEmail(String email);
    AppUser save(AppUser user);
}
