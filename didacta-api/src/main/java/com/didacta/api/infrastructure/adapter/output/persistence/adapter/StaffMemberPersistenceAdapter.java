package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.StaffMemberRepositoryPort;
import com.didacta.api.domain.model.StaffMember;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaStaffMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StaffMemberPersistenceAdapter implements StaffMemberRepositoryPort {

    private final JpaStaffMemberRepository jpaRepo;

    @Override
    public StaffMember save(StaffMember staffMember) {
        return jpaRepo.save(staffMember);
    }

    @Override
    public Optional<StaffMember> findById(UUID id) {
        return jpaRepo.findById(id);
    }

    @Override
    public List<StaffMember> findByInstitutionId(UUID institutionId) {
        return jpaRepo.findByInstitutionId(institutionId);
    }

    @Override
    public List<StaffMember> findByFilters(UUID institutionId, UUID campusId, String category, String status, String search) {
        return jpaRepo.findByFilters(institutionId, campusId, category, status, search);
    }

    @Override
    public long countByInstitutionId(UUID institutionId) {
        return jpaRepo.countByInstitutionId(institutionId);
    }

    @Override
    public boolean existsByInstitutionIdAndEmail(UUID institutionId, String email) {
        return jpaRepo.existsByInstitutionIdAndEmail(institutionId, email);
    }
}
