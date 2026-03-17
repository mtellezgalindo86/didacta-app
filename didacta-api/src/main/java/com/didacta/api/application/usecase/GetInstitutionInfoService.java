package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.mapper.OnboardingMapper;
import com.didacta.api.application.port.input.GetInstitutionInfoUseCase;
import com.didacta.api.application.port.output.*;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetInstitutionInfoService implements GetInstitutionInfoUseCase {

    private final UserRepositoryPort userRepository;
    private final MembershipRepositoryPort membershipRepository;
    private final CampusRepositoryPort campusRepository;
    private final GroupRepositoryPort groupRepository;
    private final AcademicSectionRepositoryPort sectionRepository;
    private final TenantProviderPort tenantProvider;

    @Override
    @Transactional(readOnly = true)
    public OnboardingResult.InstitutionLevel getLevel(String keycloakUserId) {
        AppUser user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new EntityNotFoundException("User", keycloakUserId));

        Optional<InstitutionUser> membership = membershipRepository.findByUser(user).stream().findFirst();
        String level = membership.map(m -> m.getInstitution().getMainLevel()).orElse("PREESCOLAR");

        return OnboardingResult.InstitutionLevel.builder().level(level).build();
    }

    @Override
    @Transactional(readOnly = true)
    public OnboardingCommand.CreateInstitution getDetails(String keycloakUserId) {
        AppUser user = userRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new EntityNotFoundException("User", keycloakUserId));

        Optional<InstitutionUser> membership = membershipRepository.findByUser(user).stream().findFirst();
        if (membership.isEmpty()) return null;

        Institution institution = membership.get().getInstitution();
        Optional<Campus> campus = campusRepository.findFirstByInstitutionId(institution.getId());

        boolean hasMultipleCampuses = campus.isPresent() && !"Sede Principal".equals(campus.get().getName());
        String campusName = hasMultipleCampuses ? campus.get().getName() : null;

        OnboardingCommand.CreateInstitution details = OnboardingMapper.toInstitutionDetails(
                institution, membership.get(), campusName, hasMultipleCampuses);

        // Add sections data
        List<AcademicSection> sections = sectionRepository.findByInstitutionId(institution.getId());
        if (!sections.isEmpty()) {
            List<OnboardingCommand.SectionEntry> sectionEntries = sections.stream()
                    .map(s -> {
                        OnboardingCommand.SectionEntry entry = new OnboardingCommand.SectionEntry();
                        entry.setLevel(s.getLevel());
                        entry.setAccreditationType(s.getAccreditationType());
                        entry.setAccreditationKey(s.getAccreditationKey());
                        return entry;
                    })
                    .toList();
            details.setSections(sectionEntries);
        }

        return details;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OnboardingResult.CampusDto> getCampuses() {
        String tenantId = tenantProvider.getTenantId();
        if (tenantId == null) return List.of();
        UUID institutionId = UUID.fromString(tenantId);
        return campusRepository.findByInstitutionId(institutionId).stream()
                .map(c -> OnboardingResult.CampusDto.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .address(c.getAddress())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OnboardingResult.GroupDto> getGroups() {
        String tenantId = tenantProvider.getTenantId();
        if (tenantId == null) return List.of();
        return groupRepository.findByInstitutionId(UUID.fromString(tenantId)).stream()
                .map(g -> OnboardingResult.GroupDto.builder()
                        .id(g.getId())
                        .name(g.getName())
                        .gradeLevel(g.getGradeLevel())
                        .shift(g.getShift())
                        .sectionId(g.getSection() != null ? g.getSection().getId() : null)
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OnboardingResult.AcademicSectionDto> getSections() {
        String tenantId = tenantProvider.getTenantId();
        if (tenantId == null) return List.of();
        UUID institutionId = UUID.fromString(tenantId);
        return sectionRepository.findByInstitutionId(institutionId).stream()
                .map(s -> OnboardingResult.AcademicSectionDto.builder()
                        .id(s.getId())
                        .level(s.getLevel())
                        .accreditationType(s.getAccreditationType())
                        .accreditationKey(s.getAccreditationKey())
                        .build())
                .toList();
    }
}
