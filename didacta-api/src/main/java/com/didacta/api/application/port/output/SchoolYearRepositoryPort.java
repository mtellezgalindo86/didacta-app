package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.SchoolYear;

import java.util.Optional;
import java.util.UUID;

public interface SchoolYearRepositoryPort {
    Optional<SchoolYear> findByInstitutionIdAndStatus(UUID institutionId, String status);
    SchoolYear save(SchoolYear schoolYear);
}
