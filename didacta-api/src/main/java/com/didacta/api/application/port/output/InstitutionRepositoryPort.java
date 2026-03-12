package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.Institution;

import java.util.Optional;
import java.util.UUID;

public interface InstitutionRepositoryPort {
    Optional<Institution> findById(UUID id);
    Institution save(Institution institution);
}
