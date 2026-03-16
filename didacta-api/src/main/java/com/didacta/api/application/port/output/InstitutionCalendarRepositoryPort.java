package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.InstitutionCalendar;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstitutionCalendarRepositoryPort {
    InstitutionCalendar save(InstitutionCalendar calendar);
    Optional<InstitutionCalendar> findById(UUID id);
    List<InstitutionCalendar> findByInstitutionId(UUID institutionId);
    Optional<InstitutionCalendar> findByInstitutionIdAndSectionIdAndSchoolYearId(UUID institutionId, UUID sectionId, UUID schoolYearId);
    void deleteById(UUID id);
}
