package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.CalendarTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaCalendarTemplateRepository extends JpaRepository<CalendarTemplate, UUID> {
    List<CalendarTemplate> findByActiveTrue();

    @Query("SELECT ct FROM CalendarTemplate ct WHERE ct.active = true AND ct.applicableLevels LIKE %:level%")
    List<CalendarTemplate> findByApplicableLevel(@Param("level") String level);

    @Query("SELECT ct FROM CalendarTemplate ct WHERE ct.active = true AND ct.applicableLevels LIKE %:level% AND ct.requiresAccreditation = :requiresAccreditation")
    List<CalendarTemplate> findByApplicableLevelAndAccreditation(@Param("level") String level, @Param("requiresAccreditation") boolean requiresAccreditation);
}
