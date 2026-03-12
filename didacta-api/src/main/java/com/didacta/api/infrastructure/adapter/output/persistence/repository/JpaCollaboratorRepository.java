package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.CollaboratorPreUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaCollaboratorRepository extends JpaRepository<CollaboratorPreUser, UUID> {
    List<CollaboratorPreUser> findByInstitutionId(UUID institutionId);
    boolean existsByInstitutionIdAndEmailIgnoreCase(UUID institutionId, String email);
}
