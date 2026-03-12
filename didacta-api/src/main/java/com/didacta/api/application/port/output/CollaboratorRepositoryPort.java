package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.CollaboratorPreUser;

import java.util.List;
import java.util.UUID;

public interface CollaboratorRepositoryPort {
    List<CollaboratorPreUser> findByInstitutionId(UUID institutionId);
    boolean existsByInstitutionIdAndEmail(UUID institutionId, String email);
    CollaboratorPreUser save(CollaboratorPreUser collaborator);
}
