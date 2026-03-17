package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.CalendarTemplateEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaCalendarTemplateEventRepository extends JpaRepository<CalendarTemplateEvent, UUID> {
    List<CalendarTemplateEvent> findByTemplateIdOrderBySortOrderAsc(UUID templateId);
}
