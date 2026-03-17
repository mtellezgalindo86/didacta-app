package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.InstitutionCalendarRepositoryPort;
import com.didacta.api.domain.model.InstitutionCalendar;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaInstitutionCalendarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class InstitutionCalendarPersistenceAdapter implements InstitutionCalendarRepositoryPort {

    private final JpaInstitutionCalendarRepository jpaRepo;

    @Override
    public InstitutionCalendar save(InstitutionCalendar calendar) {
        return jpaRepo.save(calendar);
    }

    @Override
    public Optional<InstitutionCalendar> findById(UUID id) {
        return jpaRepo.findById(id);
    }

    @Override
    public List<InstitutionCalendar> findByInstitutionId(UUID institutionId) {
        return jpaRepo.findByInstitutionId(institutionId);
    }

    @Override
    public Optional<InstitutionCalendar> findByInstitutionIdAndSectionIdAndSchoolYearId(UUID institutionId, UUID sectionId, UUID schoolYearId) {
        return jpaRepo.findByInstitutionIdAndSectionIdAndSchoolYearId(institutionId, sectionId, schoolYearId);
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }
}
