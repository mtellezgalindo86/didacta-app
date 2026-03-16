package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaCalendarEventRepository extends JpaRepository<CalendarEvent, UUID> {
    List<CalendarEvent> findByCalendarIdOrderByStartDateAsc(UUID calendarId);
    void deleteByCalendarId(UUID calendarId);
}
