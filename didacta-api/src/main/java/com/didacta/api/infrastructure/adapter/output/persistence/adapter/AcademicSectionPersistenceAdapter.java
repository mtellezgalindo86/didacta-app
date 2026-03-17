package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.AcademicSectionRepositoryPort;
import com.didacta.api.domain.model.AcademicSection;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaAcademicSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AcademicSectionPersistenceAdapter implements AcademicSectionRepositoryPort {

    private final JpaAcademicSectionRepository jpaRepo;

    @Override
    public AcademicSection save(AcademicSection section) {
        return jpaRepo.save(section);
    }

    @Override
    public Optional<AcademicSection> findById(UUID id) {
        return jpaRepo.findById(id);
    }

    @Override
    public List<AcademicSection> findByInstitutionId(UUID institutionId) {
        return jpaRepo.findByInstitutionIdOrderByDisplayOrderAsc(institutionId);
    }

    @Override
    public Optional<AcademicSection> findByInstitutionIdAndLevel(UUID institutionId, String level) {
        return jpaRepo.findByInstitutionIdAndLevel(institutionId, level);
    }

    @Override
    public void deleteByInstitutionId(UUID institutionId) {
        jpaRepo.deleteByInstitutionId(institutionId);
    }
}
