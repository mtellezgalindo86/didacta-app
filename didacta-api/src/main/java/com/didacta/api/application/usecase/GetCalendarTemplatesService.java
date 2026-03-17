package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.CalendarDto;
import com.didacta.api.application.port.input.GetCalendarTemplatesUseCase;
import com.didacta.api.application.port.output.CalendarTemplateRepositoryPort;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.CalendarTemplate;
import com.didacta.api.domain.model.CalendarTemplateEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetCalendarTemplatesService implements GetCalendarTemplatesUseCase {

    private final CalendarTemplateRepositoryPort templateRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CalendarDto.TemplateResponse> listAll() {
        return templateRepository.findAllActive().stream()
                .map(this::toTemplateResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalendarDto.TemplateResponse> listByLevel(String level) {
        return templateRepository.findByApplicableLevelAndAccreditation(level, false).stream()
                .map(this::toTemplateResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CalendarDto.TemplateDetailResponse getTemplateWithEvents(UUID templateId) {
        CalendarTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new EntityNotFoundException("CalendarTemplate", templateId.toString()));

        List<CalendarTemplateEvent> events = templateRepository.findEventsByTemplateId(templateId);

        return CalendarDto.TemplateDetailResponse.builder()
                .template(toTemplateResponse(template))
                .events(events.stream().map(this::toTemplateEventResponse).toList())
                .build();
    }

    private CalendarDto.TemplateResponse toTemplateResponse(CalendarTemplate t) {
        return CalendarDto.TemplateResponse.builder()
                .id(t.getId())
                .code(t.getCode())
                .name(t.getName())
                .description(t.getDescription())
                .yearLabel(t.getYearLabel())
                .periodType(t.getPeriodType())
                .authority(t.getAuthority())
                .applicableLevels(t.getApplicableLevels())
                .requiresAccreditation(t.getRequiresAccreditation())
                .accreditationAuthority(t.getAccreditationAuthority())
                .startDate(t.getStartDate())
                .endDate(t.getEndDate())
                .expectedClassDays(t.getExpectedClassDays())
                .build();
    }

    private CalendarDto.TemplateEventResponse toTemplateEventResponse(CalendarTemplateEvent e) {
        return CalendarDto.TemplateEventResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .eventType(e.getEventType())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .affectsClasses(e.getAffectsClasses())
                .affectsStaff(e.getAffectsStaff())
                .isMandatory(e.getIsMandatory())
                .sortOrder(e.getSortOrder())
                .build();
    }
}
