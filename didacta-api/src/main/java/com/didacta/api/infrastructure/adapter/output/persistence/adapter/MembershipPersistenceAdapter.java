package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.MembershipRepositoryPort;
import com.didacta.api.domain.model.AppUser;
import com.didacta.api.domain.model.InstitutionUser;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaInstitutionUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MembershipPersistenceAdapter implements MembershipRepositoryPort {

    private final JpaInstitutionUserRepository jpaRepo;

    @Override
    public List<InstitutionUser> findByUser(AppUser user) {
        return jpaRepo.findByUser(user);
    }

    @Override
    public Optional<InstitutionUser> findByInstitutionIdAndUserId(UUID institutionId, UUID userId) {
        return jpaRepo.findByInstitutionIdAndUserId(institutionId, userId);
    }

    @Override
    public InstitutionUser save(InstitutionUser membership) {
        return jpaRepo.save(membership);
    }
}
