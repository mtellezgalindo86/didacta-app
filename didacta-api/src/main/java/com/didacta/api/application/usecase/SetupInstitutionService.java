package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.port.input.SetupInstitutionUseCase;
import com.didacta.api.application.port.output.*;
import com.didacta.api.domain.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SetupInstitutionService implements SetupInstitutionUseCase {

    private final TenantProviderPort tenantProvider;
    private final InstitutionRepositoryPort institutionRepository;
    private final SchoolYearRepositoryPort schoolYearRepository;
    private final AcademicSectionRepositoryPort sectionRepository;
    private final CalendarTemplateRepositoryPort templateRepository;
    private final InstitutionCalendarRepositoryPort calendarRepository;
    private final CalendarEventRepositoryPort calendarEventRepository;

    @Override
    @Transactional
    public void setupSectionsAndCalendars(OnboardingCommand.CreateInstitution command) {
        java.util.UUID institutionId = tenantProvider.getTenantUUID();
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new com.didacta.api.domain.exception.EntityNotFoundException("Institution", institutionId.toString()));

        // Create academic sections
        List<OnboardingCommand.SectionEntry> sections = command.getSections();
        if (sections == null || sections.isEmpty()) {
            createSectionIfNotExists(institution, command.getMainLevel(), "NONE", null, 0);
        } else {
            int order = 0;
            for (OnboardingCommand.SectionEntry entry : sections) {
                createSectionIfNotExists(institution, entry.getLevel(),
                        entry.getAccreditationType(), entry.getAccreditationKey(), order++);
            }
        }

        // Auto-assign calendars for each section
        autoAssignCalendars(institution);
    }

    private void createSectionIfNotExists(Institution institution, String level,
                                           String accreditationType, String accreditationKey, int order) {
        Optional<AcademicSection> existing = sectionRepository.findByInstitutionIdAndLevel(institution.getId(), level);
        if (existing.isPresent()) {
            AcademicSection section = existing.get();
            section.setAccreditationType(accreditationType);
            section.setAccreditationKey(accreditationKey);
            section.setDisplayOrder(order);
            sectionRepository.save(section);
        } else {
            AcademicSection section = AcademicSection.builder()
                    .institution(institution)
                    .level(level)
                    .accreditationType(accreditationType != null ? accreditationType : "NONE")
                    .accreditationKey(accreditationKey)
                    .displayOrder(order)
                    .active(true)
                    .build();
            sectionRepository.save(section);
        }
    }

    private void autoAssignCalendars(Institution institution) {
        Optional<SchoolYear> schoolYearOpt = schoolYearRepository.findByInstitutionIdAndStatus(institution.getId(), "ACTIVE");
        if (schoolYearOpt.isEmpty()) return;

        SchoolYear schoolYear = schoolYearOpt.get();
        List<AcademicSection> sections = sectionRepository.findByInstitutionId(institution.getId());

        for (AcademicSection section : sections) {
            Optional<InstitutionCalendar> existingCal = calendarRepository
                    .findByInstitutionIdAndSectionIdAndSchoolYearId(institution.getId(), section.getId(), schoolYear.getId());
            if (existingCal.isPresent()) continue;

            boolean hasAccreditation = !"NONE".equals(section.getAccreditationType());
            List<CalendarTemplate> templates;

            // First try to match by specific authority (e.g., UNAM_DGIRE, SEP_RVOE, IPN)
            if (hasAccreditation) {
                templates = templateRepository.findByApplicableLevelAndAuthority(
                        section.getLevel(), section.getAccreditationType());
            } else {
                templates = templateRepository.findByApplicableLevelAndAccreditation(
                        section.getLevel(), false);
            }

            // Fallback: any accredited template for this level
            if (templates.isEmpty() && hasAccreditation) {
                templates = templateRepository.findByApplicableLevelAndAccreditation(
                        section.getLevel(), true);
            }

            // Final fallback: non-accredited template for this level
            if (templates.isEmpty()) {
                templates = templateRepository.findByApplicableLevelAndAccreditation(
                        section.getLevel(), false);
            }

            if (templates.isEmpty()) continue;

            CalendarTemplate template = templates.get(0);

            InstitutionCalendar calendar = InstitutionCalendar.builder()
                    .institution(institution)
                    .section(section)
                    .schoolYear(schoolYear)
                    .sourceTemplate(template)
                    .name(template.getName())
                    .status("ACTIVE")
                    .build();
            calendarRepository.save(calendar);

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
            calendarEventRepository.saveAll(calendarEvents);
        }
    }
}
