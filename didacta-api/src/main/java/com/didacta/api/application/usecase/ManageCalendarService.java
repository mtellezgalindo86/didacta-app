package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.CalendarDto;
import com.didacta.api.application.port.input.ManageCalendarUseCase;
import com.didacta.api.application.port.output.*;
import com.didacta.api.domain.exception.DomainException;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ManageCalendarService implements ManageCalendarUseCase {

    private final InstitutionCalendarRepositoryPort calendarRepository;
    private final CalendarEventRepositoryPort eventRepository;
    private final CalendarTemplateRepositoryPort templateRepository;
    private final AcademicSectionRepositoryPort sectionRepository;
    private final InstitutionRepositoryPort institutionRepository;
    private final SchoolYearRepositoryPort schoolYearRepository;
    private final TenantProviderPort tenantProvider;

    @Override
    @Transactional
    public CalendarDto.CalendarResponse createFromTemplate(CalendarDto.CreateFromTemplate command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new EntityNotFoundException("Institution", institutionId.toString()));

        CalendarTemplate template = templateRepository.findById(command.getTemplateId())
                .orElseThrow(() -> new EntityNotFoundException("CalendarTemplate", command.getTemplateId().toString()));

        SchoolYear schoolYear = schoolYearRepository.findByInstitutionIdAndStatus(institutionId, "ACTIVE")
                .orElseThrow(() -> new DomainException("No active school year found"));

        AcademicSection section = null;
        if (command.getSectionId() != null) {
            section = sectionRepository.findById(command.getSectionId())
                    .filter(s -> s.getInstitution().getId().equals(institutionId))
                    .orElseThrow(() -> new EntityNotFoundException("AcademicSection", command.getSectionId().toString()));
        }

        // Check if calendar already exists for this section + school year
        UUID sectionId = section != null ? section.getId() : null;
        calendarRepository.findByInstitutionIdAndSectionIdAndSchoolYearId(institutionId, sectionId, schoolYear.getId())
                .ifPresent(existing -> {
                    throw new DomainException("Calendar already exists for this section and school year");
                });

        // Create institution calendar
        InstitutionCalendar calendar = InstitutionCalendar.builder()
                .institution(institution)
                .section(section)
                .schoolYear(schoolYear)
                .sourceTemplate(template)
                .name(template.getName())
                .status("ACTIVE")
                .build();
        calendarRepository.save(calendar);

        // Copy template events to calendar events
        List<CalendarTemplateEvent> templateEvents = templateRepository.findEventsByTemplateId(template.getId());
        List<CalendarEvent> calendarEvents = templateEvents.stream()
                .map(te -> CalendarEvent.builder()
                        .calendar(calendar)
                        .sourceTemplateEvent(te)
                        .name(te.getName())
                        .eventType(te.getEventType())
                        .startDate(te.getStartDate())
                        .endDate(te.getEndDate())
                        .affectsClasses(te.getAffectsClasses())
                        .affectsStaff(te.getAffectsStaff())
                        .isFromTemplate(true)
                        .isDeleted(false)
                        .build())
                .toList();
        eventRepository.saveAll(calendarEvents);

        return toCalendarResponse(calendar);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalendarDto.CalendarResponse> listByInstitution() {
        UUID institutionId = tenantProvider.getTenantUUID();
        return calendarRepository.findByInstitutionId(institutionId).stream()
                .map(this::toCalendarResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CalendarDto.CalendarDetailResponse getCalendarWithEvents(UUID calendarId) {
        UUID institutionId = tenantProvider.getTenantUUID();

        InstitutionCalendar calendar = calendarRepository.findById(calendarId)
                .filter(c -> c.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new EntityNotFoundException("InstitutionCalendar", calendarId.toString()));

        List<CalendarEvent> events = eventRepository.findByCalendarId(calendarId);

        return CalendarDto.CalendarDetailResponse.builder()
                .calendar(toCalendarResponse(calendar))
                .events(events.stream().map(this::toEventResponse).toList())
                .build();
    }

    @Override
    @Transactional
    public CalendarDto.EventResponse addEvent(UUID calendarId, CalendarDto.CreateEvent command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        InstitutionCalendar calendar = calendarRepository.findById(calendarId)
                .filter(c -> c.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new EntityNotFoundException("InstitutionCalendar", calendarId.toString()));

        CalendarEvent event = CalendarEvent.builder()
                .calendar(calendar)
                .name(command.getName())
                .eventType(command.getEventType())
                .startDate(command.getStartDate())
                .endDate(command.getEndDate())
                .affectsClasses(command.getAffectsClasses() != null ? command.getAffectsClasses() : true)
                .affectsStaff(command.getAffectsStaff() != null ? command.getAffectsStaff() : false)
                .isFromTemplate(false)
                .isDeleted(false)
                .notes(command.getNotes())
                .build();
        eventRepository.save(event);

        return toEventResponse(event);
    }

    @Override
    @Transactional
    public CalendarDto.EventResponse updateEvent(UUID calendarId, UUID eventId, CalendarDto.UpdateEvent command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        // Validate calendar ownership
        calendarRepository.findById(calendarId)
                .filter(c -> c.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new EntityNotFoundException("InstitutionCalendar", calendarId.toString()));

        CalendarEvent event = eventRepository.findById(eventId)
                .filter(e -> e.getCalendar().getId().equals(calendarId))
                .orElseThrow(() -> new EntityNotFoundException("CalendarEvent", eventId.toString()));

        if (command.getName() != null) event.setName(command.getName());
        if (command.getEventType() != null) event.setEventType(command.getEventType());
        if (command.getStartDate() != null) event.setStartDate(command.getStartDate());
        if (command.getEndDate() != null) event.setEndDate(command.getEndDate());
        if (command.getAffectsClasses() != null) event.setAffectsClasses(command.getAffectsClasses());
        if (command.getAffectsStaff() != null) event.setAffectsStaff(command.getAffectsStaff());
        if (command.getNotes() != null) event.setNotes(command.getNotes());

        eventRepository.save(event);
        return toEventResponse(event);
    }

    @Override
    @Transactional
    public void softDeleteEvent(UUID calendarId, UUID eventId) {
        UUID institutionId = tenantProvider.getTenantUUID();

        calendarRepository.findById(calendarId)
                .filter(c -> c.getInstitution().getId().equals(institutionId))
                .orElseThrow(() -> new EntityNotFoundException("InstitutionCalendar", calendarId.toString()));

        CalendarEvent event = eventRepository.findById(eventId)
                .filter(e -> e.getCalendar().getId().equals(calendarId))
                .orElseThrow(() -> new EntityNotFoundException("CalendarEvent", eventId.toString()));

        event.setIsDeleted(true);
        eventRepository.save(event);
    }

    private CalendarDto.CalendarResponse toCalendarResponse(InstitutionCalendar c) {
        return CalendarDto.CalendarResponse.builder()
                .id(c.getId())
                .sectionId(c.getSection() != null ? c.getSection().getId() : null)
                .sectionLevel(c.getSection() != null ? c.getSection().getLevel() : null)
                .schoolYearId(c.getSchoolYear().getId())
                .sourceTemplateId(c.getSourceTemplate() != null ? c.getSourceTemplate().getId() : null)
                .name(c.getName())
                .status(c.getStatus())
                .build();
    }

    private CalendarDto.EventResponse toEventResponse(CalendarEvent e) {
        return CalendarDto.EventResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .eventType(e.getEventType())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .affectsClasses(e.getAffectsClasses())
                .affectsStaff(e.getAffectsStaff())
                .isFromTemplate(e.getIsFromTemplate())
                .isDeleted(e.getIsDeleted())
                .notes(e.getNotes())
                .build();
    }
}
