package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.GuardianRepositoryPort;
import com.didacta.api.domain.model.Guardian;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaGuardianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class GuardianPersistenceAdapter implements GuardianRepositoryPort {

    private final JpaGuardianRepository jpaRepo;

    @Override
    public Guardian save(Guardian guardian) {
        return jpaRepo.save(guardian);
    }

    @Override
    public Optional<Guardian> findById(UUID id) {
        return jpaRepo.findById(id);
    }

    @Override
    public Optional<Guardian> findByInstitutionIdAndPhone(UUID institutionId, String phone) {
        return jpaRepo.findByInstitutionIdAndPhone(institutionId, phone);
    }

    @Override
    public List<Guardian> findByInstitutionId(UUID institutionId) {
        return jpaRepo.findByInstitutionId(institutionId);
    }

    @Override
    public List<Guardian> findByFilters(UUID institutionId, String status, String search) {
        return jpaRepo.findByFilters(institutionId, status, search);
    }

    @Override
    public long countByInstitutionId(UUID institutionId) {
        return jpaRepo.countByInstitutionId(institutionId);
    }

    @Override
    public boolean existsByInstitutionIdAndPhoneAndIdNot(UUID institutionId, String phone, UUID id) {
        return jpaRepo.existsByInstitutionIdAndPhoneAndIdNot(institutionId, phone, id);
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }
}
