package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.AppUser;
import com.didacta.api.domain.model.InstitutionUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaInstitutionUserRepository extends JpaRepository<InstitutionUser, UUID> {
    Optional<InstitutionUser> findByInstitutionIdAndUserId(UUID institutionId, UUID userId);
    List<InstitutionUser> findByUser(AppUser user);
}
