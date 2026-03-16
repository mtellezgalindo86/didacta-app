package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.CalendarEvent;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CalendarEventRepositoryPort {
    CalendarEvent save(CalendarEvent event);
    List<CalendarEvent> saveAll(List<CalendarEvent> events);
    Optional<CalendarEvent> findById(UUID id);
    List<CalendarEvent> findByCalendarId(UUID calendarId);
    void deleteByCalendarId(UUID calendarId);
}
