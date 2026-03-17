package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.InstitutionCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaInstitutionCalendarRepository extends JpaRepository<InstitutionCalendar, UUID> {
    List<InstitutionCalendar> findByInstitutionId(UUID institutionId);
    Optional<InstitutionCalendar> findByInstitutionIdAndSectionIdAndSchoolYearId(UUID institutionId, UUID sectionId, UUID schoolYearId);
}
