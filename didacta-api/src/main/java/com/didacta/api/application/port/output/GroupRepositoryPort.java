package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.GroupEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupRepositoryPort {
    List<GroupEntity> findByInstitutionId(UUID institutionId);
    Optional<GroupEntity> findById(UUID id);
    GroupEntity save(GroupEntity group);
}
