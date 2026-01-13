package com.didacta.api.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByKeycloakUserId(String keycloakUserId);
    Optional<AppUser> findByEmail(String email);
}
