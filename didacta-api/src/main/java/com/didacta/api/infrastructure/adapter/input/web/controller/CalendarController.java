package com.didacta.api.infrastructure.adapter.input.web.controller;

import com.didacta.api.application.dto.CalendarDto;
import com.didacta.api.application.port.input.ManageCalendarUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/calendars")
@RequiredArgsConstructor
public class CalendarController {

    private final ManageCalendarUseCase manageCalendar;

    @PostMapping
    public ResponseEntity<CalendarDto.CalendarResponse> createFromTemplate(
            @Valid @RequestBody CalendarDto.CreateFromTemplate command) {
        return ResponseEntity.ok(manageCalendar.createFromTemplate(command));
    }

    @GetMapping
    public ResponseEntity<List<CalendarDto.CalendarResponse>> listCalendars() {
        return ResponseEntity.ok(manageCalendar.listByInstitution());
    }

    @GetMapping("/{calendarId}")
    public ResponseEntity<CalendarDto.CalendarDetailResponse> getCalendar(@PathVariable UUID calendarId) {
        return ResponseEntity.ok(manageCalendar.getCalendarWithEvents(calendarId));
    }

    @PostMapping("/{calendarId}/events")
    public ResponseEntity<CalendarDto.EventResponse> addEvent(
            @PathVariable UUID calendarId,
            @Valid @RequestBody CalendarDto.CreateEvent command) {
        return ResponseEntity.ok(manageCalendar.addEvent(calendarId, command));
    }

    @PatchMapping("/{calendarId}/events/{eventId}")
    public ResponseEntity<CalendarDto.EventResponse> updateEvent(
            @PathVariable UUID calendarId,
            @PathVariable UUID eventId,
            @Valid @RequestBody CalendarDto.UpdateEvent command) {
        return ResponseEntity.ok(manageCalendar.updateEvent(calendarId, eventId, command));
    }

    @DeleteMapping("/{calendarId}/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable UUID calendarId,
            @PathVariable UUID eventId) {
        manageCalendar.softDeleteEvent(calendarId, eventId);
        return ResponseEntity.noContent().build();
    }
}
