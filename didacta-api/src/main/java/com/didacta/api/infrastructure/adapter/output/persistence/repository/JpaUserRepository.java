package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByKeycloakUserId(String keycloakUserId);
    Optional<AppUser> findByEmail(String email);
}
