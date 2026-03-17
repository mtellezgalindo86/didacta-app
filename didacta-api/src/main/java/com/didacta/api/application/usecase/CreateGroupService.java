package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.input.CreateGroupUseCase;
import com.didacta.api.application.port.output.*;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.AcademicSection;
import com.didacta.api.domain.model.Campus;
import com.didacta.api.domain.model.GroupEntity;
import com.didacta.api.domain.model.Institution;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreateGroupService implements CreateGroupUseCase {

    private final InstitutionRepositoryPort institutionRepository;
    private final GroupRepositoryPort groupRepository;
    private final CampusRepositoryPort campusRepository;
    private final AcademicSectionRepositoryPort sectionRepository;
    private final TenantProviderPort tenantProvider;

    @Override
    @Transactional
    public OnboardingResult.GroupCreated execute(String keycloakUserId, OnboardingCommand.CreateGroup command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new EntityNotFoundException("Institution", institutionId.toString()));

        Optional<GroupEntity> existingGroup = groupRepository.findByInstitutionId(institutionId).stream()
                .filter(g -> g.getName().equalsIgnoreCase(command.getName()))
                .findFirst();

        GroupEntity group;
        if (existingGroup.isPresent()) {
            group = existingGroup.get();
        } else {
            group = new GroupEntity();
            group.setInstitution(institution);
            group.setName(command.getName());
            group.setActive(true);
        }

        group.setGradeLevel(command.getGradeLevel());
        group.setShift(command.getShift());

        if (command.getCampusId() != null) {
            Campus campus = campusRepository.findById(command.getCampusId())
                    .filter(c -> c.getInstitution().getId().equals(institutionId))
                    .orElseThrow(() -> new EntityNotFoundException("Campus", command.getCampusId().toString()));
            group.setCampus(campus);
        } else {
            Campus defaultCampus = campusRepository.findFirstByInstitutionId(institutionId)
                    .orElseThrow(() -> new EntityNotFoundException("Campus", "default for " + institutionId));
            group.setCampus(defaultCampus);
        }

        // Set section if provided
        if (command.getSectionId() != null) {
            AcademicSection section = sectionRepository.findById(command.getSectionId())
                    .filter(s -> s.getInstitution().getId().equals(institutionId))
                    .orElseThrow(() -> new EntityNotFoundException("AcademicSection", command.getSectionId().toString()));
            group.setSection(section);
        } else {
            // Auto-assign first section if only one exists
            List<AcademicSection> sections = sectionRepository.findByInstitutionId(institutionId);
            if (sections.size() == 1) {
                group.setSection(sections.get(0));
            }
        }

        groupRepository.save(group);

        return OnboardingResult.GroupCreated.builder()
                .groupId(group.getId())
                .nextStep("STEP_3")
                .build();
    }
}
