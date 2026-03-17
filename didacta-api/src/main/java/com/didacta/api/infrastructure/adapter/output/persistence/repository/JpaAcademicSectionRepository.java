package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.AcademicSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaAcademicSectionRepository extends JpaRepository<AcademicSection, UUID> {
    List<AcademicSection> findByInstitutionIdOrderByDisplayOrderAsc(UUID institutionId);
    Optional<AcademicSection> findByInstitutionIdAndLevel(UUID institutionId, String level);
    void deleteByInstitutionId(UUID institutionId);
}
