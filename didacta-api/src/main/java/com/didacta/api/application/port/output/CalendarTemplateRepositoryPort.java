package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.CalendarTemplate;
import com.didacta.api.domain.model.CalendarTemplateEvent;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CalendarTemplateRepositoryPort {
    List<CalendarTemplate> findAllActive();
    Optional<CalendarTemplate> findById(UUID id);
    List<CalendarTemplate> findByApplicableLevelAndAccreditation(String level, boolean requiresAccreditation);
    List<CalendarTemplate> findByApplicableLevelAndAuthority(String level, String authority);
    List<CalendarTemplateEvent> findEventsByTemplateId(UUID templateId);
}
