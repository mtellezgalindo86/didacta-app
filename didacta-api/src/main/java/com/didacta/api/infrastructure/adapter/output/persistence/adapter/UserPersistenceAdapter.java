package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.UserRepositoryPort;
import com.didacta.api.domain.model.AppUser;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements UserRepositoryPort {

    private final JpaUserRepository jpaRepo;

    @Override
    public Optional<AppUser> findByKeycloakUserId(String keycloakUserId) {
        return jpaRepo.findByKeycloakUserId(keycloakUserId);
    }

    @Override
    public Optional<AppUser> findByEmail(String email) {
        return jpaRepo.findByEmail(email);
    }

    @Override
    public AppUser save(AppUser user) {
        return jpaRepo.save(user);
    }
}
