package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.mapper.OnboardingMapper;
import com.didacta.api.application.port.input.GetInstitutionInfoUseCase;
import com.didacta.api.application.port.output.CampusRepositoryPort;
import com.didacta.api.application.port.output.GroupRepositoryPort;
import com.didacta.api.application.port.output.MembershipRepositoryPort;
import com.didacta.api.application.port.output.TenantProviderPort;
import com.didacta.api.application.port.output.UserRepositoryPort;
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

        return OnboardingMapper.toInstitutionDetails(institution, membership.get(), campusName, hasMultipleCampuses);
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
                        .build())
                .toList();
    }
}
