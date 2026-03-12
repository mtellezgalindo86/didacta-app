package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.Campus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CampusRepositoryPort {
    Optional<Campus> findById(UUID id);
    Optional<Campus> findFirstByInstitutionId(UUID institutionId);
    List<Campus> findByInstitutionId(UUID institutionId);
    Campus save(Campus campus);
}
