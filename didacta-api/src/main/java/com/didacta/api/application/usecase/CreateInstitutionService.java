package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.input.CreateInstitutionUseCase;
import com.didacta.api.application.port.output.*;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CreateInstitutionService implements CreateInstitutionUseCase {

    private final UserRepositoryPort userRepository;
    private final InstitutionRepositoryPort institutionRepository;
    private final MembershipRepositoryPort membershipRepository;
    private final CampusRepositoryPort campusRepository;
    private final SchoolYearRepositoryPort schoolYearRepository;
    private final AcademicSectionRepositoryPort sectionRepository;
    private final CalendarTemplateRepositoryPort templateRepository;
    private final InstitutionCalendarRepositoryPort calendarRepository;
    private final CalendarEventRepositoryPort calendarEventRepository;

    @Override
    @Transactional
    public OnboardingResult.InstitutionCreated execute(String keycloakUserId, OnboardingCommand.CreateInstitution command) {
        AppUser user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new EntityNotFoundException("User", keycloakUserId));

        List<InstitutionUser> memberships = membershipRepository.findByUser(user);

        Institution institution;
        if (!memberships.isEmpty()) {
            institution = updateExisting(memberships.get(0), command);
        } else {
            institution = createNew(user, command);
        }

        return OnboardingResult.InstitutionCreated.builder()
                .institutionId(institution.getId())
                .nextStep("STEP_2")
                .build();
    }

    private Institution updateExisting(InstitutionUser membership, OnboardingCommand.CreateInstitution command) {
        Institution institution = membership.getInstitution();
        institution.setName(command.getName());
        institution.setMainLevel(command.getMainLevel());
        institution.setCountry(command.getCountry());
        institution.setTimezone(command.getTimezone());
        membership.setRole(command.getRole());

        if (command.isHasMultipleCampuses() && command.getCampusName() != null && !command.getCampusName().isBlank()) {
            Optional<Campus> existing = campusRepository.findFirstByInstitutionId(institution.getId());
            if (existing.isPresent()) {
                existing.get().setName(command.getCampusName());
            } else {
                Campus newCampus = new Campus();
                newCampus.setInstitution(institution);
                newCampus.setName(command.getCampusName());
                campusRepository.save(newCampus);
            }
        }

        institutionRepository.save(institution);
        membershipRepository.save(membership);

        // Recreate academic sections
        createOrUpdateSections(institution, command);

        return institution;
    }

    private Institution createNew(AppUser user, OnboardingCommand.CreateInstitution command) {
        Institution institution = new Institution();
        institution.setName(command.getName());
        institution.setMainLevel(command.getMainLevel());
        institution.setCountry(command.getCountry());
        institution.setTimezone(command.getTimezone());
        institution.setCreatedByUser(user);
        institutionRepository.save(institution);

        Campus campus = new Campus();
        campus.setInstitution(institution);
        campus.setName(command.isHasMultipleCampuses() && command.getCampusName() != null && !command.getCampusName().isBlank()
                ? command.getCampusName() : "Sede Principal");
        campusRepository.save(campus);

        InstitutionUser membership = new InstitutionUser();
        membership.setInstitution(institution);
        membership.setUser(user);
        membership.setRole(command.getRole());
        membership.setStatus("ACTIVE");
        membershipRepository.save(membership);

        // Auto-create school year
        SchoolYear schoolYear = createCurrentSchoolYear(institution);

        // Create academic sections and auto-assign calendars
        createOrUpdateSections(institution, command);

        return institution;
    }

    private void createOrUpdateSections(Institution institution, OnboardingCommand.CreateInstitution command) {
        List<OnboardingCommand.SectionEntry> sections = command.getSections();

        if (sections == null || sections.isEmpty()) {
            // Backward compatibility: create a single section from mainLevel
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
            // Skip if calendar already exists
            Optional<InstitutionCalendar> existingCal = calendarRepository
                    .findByInstitutionIdAndSectionIdAndSchoolYearId(institution.getId(), section.getId(), schoolYear.getId());
            if (existingCal.isPresent()) continue;

            // Find matching template
            boolean hasAccreditation = !"NONE".equals(section.getAccreditationType());
            List<CalendarTemplate> templates = templateRepository
                    .findByApplicableLevelAndAccreditation(section.getLevel(), hasAccreditation);

            if (templates.isEmpty() && hasAccreditation) {
                // Fall back to non-accreditation templates
                templates = templateRepository.findByApplicableLevelAndAccreditation(section.getLevel(), false);
            }

            if (templates.isEmpty()) continue;

            CalendarTemplate template = templates.get(0);

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

            // Copy template events
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

    private SchoolYear createCurrentSchoolYear(Institution institution) {
        java.time.LocalDate now = java.time.LocalDate.now();
        int startYear = now.getMonthValue() >= 8 ? now.getYear() : now.getYear() - 1;
        int endYear = startYear + 1;

        SchoolYear sy = new SchoolYear();
        sy.setInstitution(institution);
        sy.setName(startYear + "-" + endYear);
        sy.setStartDate(java.time.LocalDate.of(startYear, 8, 1));
        sy.setEndDate(java.time.LocalDate.of(endYear, 7, 31));
        sy.setStatus("ACTIVE");
        schoolYearRepository.save(sy);
        return sy;
    }
}
