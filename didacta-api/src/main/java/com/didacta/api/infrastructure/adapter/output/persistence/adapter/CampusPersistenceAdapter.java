package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.CampusRepositoryPort;
import com.didacta.api.domain.model.Campus;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaCampusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CampusPersistenceAdapter implements CampusRepositoryPort {

    private final JpaCampusRepository jpaRepo;

    @Override
    public Optional<Campus> findById(UUID id) {
        return jpaRepo.findById(id);
    }

    @Override
    public Optional<Campus> findFirstByInstitutionId(UUID institutionId) {
        return jpaRepo.findFirstByInstitutionId(institutionId);
    }

    @Override
    public List<Campus> findByInstitutionId(UUID institutionId) {
        return jpaRepo.findByInstitutionId(institutionId);
    }

    @Override
    public Campus save(Campus campus) {
        return jpaRepo.save(campus);
    }
}
