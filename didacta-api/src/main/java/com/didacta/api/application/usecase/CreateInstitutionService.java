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
        createCurrentSchoolYear(institution);

        return institution;
    }

    private void createCurrentSchoolYear(Institution institution) {
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
    }
}
