package com.didacta.api.application.usecase;

import com.didacta.api.application.dto.OnboardingCommand;
import com.didacta.api.application.dto.OnboardingResult;
import com.didacta.api.application.port.input.ManageCollaboratorsUseCase;
import com.didacta.api.application.port.output.CollaboratorRepositoryPort;
import com.didacta.api.application.port.output.GroupRepositoryPort;
import com.didacta.api.application.port.output.InstitutionRepositoryPort;
import com.didacta.api.application.port.output.TenantProviderPort;
import com.didacta.api.domain.exception.EntityNotFoundException;
import com.didacta.api.domain.model.CollaboratorPreUser;
import com.didacta.api.domain.model.GroupEntity;
import com.didacta.api.domain.model.Institution;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ManageCollaboratorsService implements ManageCollaboratorsUseCase {

    private final CollaboratorRepositoryPort collaboratorRepository;
    private final InstitutionRepositoryPort institutionRepository;
    private final GroupRepositoryPort groupRepository;
    private final TenantProviderPort tenantProvider;

    @Override
    @Transactional
    public OnboardingResult.CollaboratorsCreated create(String keycloakUserId, OnboardingCommand.CreateCollaborators command) {
        UUID institutionId = tenantProvider.getTenantUUID();

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new EntityNotFoundException("Institution", institutionId.toString()));

        int createdCount = 0;
        for (OnboardingCommand.CollaboratorEntry entry : command.getCollaborators()) {
            if (collaboratorRepository.existsByInstitutionIdAndEmail(institutionId, entry.getEmail())) {
                continue;
            }

            CollaboratorPreUser collaborator = new CollaboratorPreUser();
            collaborator.setInstitution(institution);
            collaborator.setEmail(entry.getEmail());
            collaborator.setFullName(entry.getFullName());
            collaborator.setRole(entry.getRole());
            collaborator.setStatus("PENDING");

            if (entry.getGroupId() != null) {
                GroupEntity group = groupRepository.findById(entry.getGroupId())
                        .filter(g -> g.getInstitution().getId().equals(institutionId))
                        .orElse(null);
                collaborator.setGroup(group);
            }

            collaboratorRepository.save(collaborator);
            createdCount++;
        }

        return OnboardingResult.CollaboratorsCreated.builder()
                .created(createdCount)
                .nextStep("DONE")
                .build();
    }
}
