package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaCampusRepository extends JpaRepository<Campus, UUID> {
    Optional<Campus> findFirstByInstitutionId(UUID institutionId);
    List<Campus> findByInstitutionId(UUID institutionId);
}
