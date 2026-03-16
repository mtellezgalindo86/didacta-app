package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.CalendarEventRepositoryPort;
import com.didacta.api.domain.model.CalendarEvent;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaCalendarEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CalendarEventPersistenceAdapter implements CalendarEventRepositoryPort {

    private final JpaCalendarEventRepository jpaRepo;

    @Override
    public CalendarEvent save(CalendarEvent event) {
        return jpaRepo.save(event);
    }

    @Override
    public List<CalendarEvent> saveAll(List<CalendarEvent> events) {
        return jpaRepo.saveAll(events);
    }

    @Override
    public Optional<CalendarEvent> findById(UUID id) {
        return jpaRepo.findById(id);
    }

    @Override
    public List<CalendarEvent> findByCalendarId(UUID calendarId) {
        return jpaRepo.findByCalendarIdOrderByStartDateAsc(calendarId);
    }

    @Override
    public void deleteByCalendarId(UUID calendarId) {
        jpaRepo.deleteByCalendarId(calendarId);
    }
}
