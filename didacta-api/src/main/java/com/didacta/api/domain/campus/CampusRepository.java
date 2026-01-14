package com.didacta.api.domain.campus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CampusRepository extends JpaRepository<Campus, UUID> {
    Optional<Campus> findFirstByInstitutionId(UUID institutionId);
}
