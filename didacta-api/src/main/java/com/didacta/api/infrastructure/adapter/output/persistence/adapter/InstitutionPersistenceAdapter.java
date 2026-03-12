package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.InstitutionRepositoryPort;
import com.didacta.api.domain.model.Institution;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaInstitutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class InstitutionPersistenceAdapter implements InstitutionRepositoryPort {

    private final JpaInstitutionRepository jpaRepo;

    @Override
    public Optional<Institution> findById(UUID id) {
        return jpaRepo.findById(id);
    }

    @Override
    public Institution save(Institution institution) {
        return jpaRepo.save(institution);
    }
}
