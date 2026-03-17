package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.AcademicSection;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AcademicSectionRepositoryPort {
    AcademicSection save(AcademicSection section);
    Optional<AcademicSection> findById(UUID id);
    List<AcademicSection> findByInstitutionId(UUID institutionId);
    Optional<AcademicSection> findByInstitutionIdAndLevel(UUID institutionId, String level);
    void deleteByInstitutionId(UUID institutionId);
}
