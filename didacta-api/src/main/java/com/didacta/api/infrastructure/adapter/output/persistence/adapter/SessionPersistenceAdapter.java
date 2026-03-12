package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.SessionRepositoryPort;
import com.didacta.api.domain.model.Session;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SessionPersistenceAdapter implements SessionRepositoryPort {

    private final JpaSessionRepository jpaRepo;

    @Override
    public Session save(Session session) {
        return jpaRepo.save(session);
    }

    @Override
    public List<Session> findAll() {
        return jpaRepo.findAll();
    }

    @Override
    public Optional<Session> findById(UUID id) {
        return jpaRepo.findById(id);
    }
}
