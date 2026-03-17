package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.CalendarDto;

import java.util.List;

public interface GetCalendarTemplatesUseCase {
    List<CalendarDto.TemplateResponse> listAll();
    List<CalendarDto.TemplateResponse> listByLevel(String level);
    CalendarDto.TemplateDetailResponse getTemplateWithEvents(java.util.UUID templateId);
}
