package com.didacta.api.infrastructure.adapter.input.web.controller;

import com.didacta.api.application.dto.CalendarDto;
import com.didacta.api.application.port.input.GetCalendarTemplatesUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/catalogs/calendar-templates")
@RequiredArgsConstructor
public class CalendarTemplateController {

    private final GetCalendarTemplatesUseCase getTemplates;

    @GetMapping
    public ResponseEntity<List<CalendarDto.TemplateResponse>> listTemplates(
            @RequestParam(required = false) String level) {
        if (level != null && !level.isBlank()) {
            return ResponseEntity.ok(getTemplates.listByLevel(level));
        }
        return ResponseEntity.ok(getTemplates.listAll());
    }

    @GetMapping("/{templateId}")
    public ResponseEntity<CalendarDto.TemplateDetailResponse> getTemplate(@PathVariable UUID templateId) {
        return ResponseEntity.ok(getTemplates.getTemplateWithEvents(templateId));
    }
}
