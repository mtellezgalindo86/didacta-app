package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.CalendarDto;

import java.util.List;
import java.util.UUID;

public interface ManageCalendarUseCase {
    CalendarDto.CalendarResponse createFromTemplate(CalendarDto.CreateFromTemplate command);
    List<CalendarDto.CalendarResponse> listByInstitution();
    CalendarDto.CalendarDetailResponse getCalendarWithEvents(UUID calendarId);
    CalendarDto.EventResponse addEvent(UUID calendarId, CalendarDto.CreateEvent command);
    CalendarDto.EventResponse updateEvent(UUID calendarId, UUID eventId, CalendarDto.UpdateEvent command);
    void softDeleteEvent(UUID calendarId, UUID eventId);
}
