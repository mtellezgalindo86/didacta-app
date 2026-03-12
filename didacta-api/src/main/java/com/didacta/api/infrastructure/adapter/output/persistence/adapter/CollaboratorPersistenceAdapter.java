package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.CollaboratorRepositoryPort;
import com.didacta.api.domain.model.CollaboratorPreUser;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaCollaboratorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CollaboratorPersistenceAdapter implements CollaboratorRepositoryPort {

    private final JpaCollaboratorRepository jpaRepo;

    @Override
    public List<CollaboratorPreUser> findByInstitutionId(UUID institutionId) {
        return jpaRepo.findByInstitutionId(institutionId);
    }

    @Override
    public boolean existsByInstitutionIdAndEmail(UUID institutionId, String email) {
        return jpaRepo.existsByInstitutionIdAndEmailIgnoreCase(institutionId, email);
    }

    @Override
    public CollaboratorPreUser save(CollaboratorPreUser collaborator) {
        return jpaRepo.save(collaborator);
    }
}
