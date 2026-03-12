package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.SchoolYear;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JpaSchoolYearRepository extends JpaRepository<SchoolYear, UUID> {
    Optional<SchoolYear> findByInstitutionIdAndStatus(UUID institutionId, String status);
}
