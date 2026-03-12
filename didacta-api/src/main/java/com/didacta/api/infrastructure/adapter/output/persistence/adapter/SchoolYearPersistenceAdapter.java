package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.SchoolYearRepositoryPort;
import com.didacta.api.domain.model.SchoolYear;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaSchoolYearRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SchoolYearPersistenceAdapter implements SchoolYearRepositoryPort {

    private final JpaSchoolYearRepository jpaRepo;

    @Override
    public Optional<SchoolYear> findByInstitutionIdAndStatus(UUID institutionId, String status) {
        return jpaRepo.findByInstitutionIdAndStatus(institutionId, status);
    }

    @Override
    public SchoolYear save(SchoolYear schoolYear) {
        return jpaRepo.save(schoolYear);
    }
}
