package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.GroupRepositoryPort;
import com.didacta.api.domain.model.GroupEntity;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaGroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class GroupPersistenceAdapter implements GroupRepositoryPort {

    private final JpaGroupRepository jpaRepo;

    @Override
    public List<GroupEntity> findByInstitutionId(UUID institutionId) {
        return jpaRepo.findByInstitutionId(institutionId);
    }

    @Override
    public Optional<GroupEntity> findById(UUID id) {
        return jpaRepo.findById(id);
    }

    @Override
    public GroupEntity save(GroupEntity group) {
        return jpaRepo.save(group);
    }
}
