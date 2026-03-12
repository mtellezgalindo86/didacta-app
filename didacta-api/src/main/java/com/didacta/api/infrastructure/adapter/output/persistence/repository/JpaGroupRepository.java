package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.GroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaGroupRepository extends JpaRepository<GroupEntity, UUID> {
    List<GroupEntity> findByInstitutionId(UUID institutionId);
}
