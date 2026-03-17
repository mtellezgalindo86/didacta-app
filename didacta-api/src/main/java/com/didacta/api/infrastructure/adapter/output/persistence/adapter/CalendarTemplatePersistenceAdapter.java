package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.CalendarTemplateRepositoryPort;
import com.didacta.api.domain.model.CalendarTemplate;
import com.didacta.api.domain.model.CalendarTemplateEvent;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaCalendarTemplateEventRepository;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaCalendarTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CalendarTemplatePersistenceAdapter implements CalendarTemplateRepositoryPort {

    private final JpaCalendarTemplateRepository templateRepo;
    private final JpaCalendarTemplateEventRepository eventRepo;

    @Override
    public List<CalendarTemplate> findAllActive() {
        return templateRepo.findByActiveTrue();
    }

    @Override
    public Optional<CalendarTemplate> findById(UUID id) {
        return templateRepo.findById(id);
    }

    @Override
    public List<CalendarTemplate> findByApplicableLevelAndAccreditation(String level, boolean requiresAccreditation) {
        return templateRepo.findByApplicableLevelAndAccreditation(level, requiresAccreditation);
    }

    @Override
    public List<CalendarTemplateEvent> findEventsByTemplateId(UUID templateId) {
        return eventRepo.findByTemplateIdOrderBySortOrderAsc(templateId);
    }
}
