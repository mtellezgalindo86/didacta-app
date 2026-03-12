package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.Session;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SessionRepositoryPort {
    Session save(Session session);
    List<Session> findAll();
    Optional<Session> findById(UUID id);
}
