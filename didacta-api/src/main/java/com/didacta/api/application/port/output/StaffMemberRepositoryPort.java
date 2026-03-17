package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.StaffMember;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffMemberRepositoryPort {
    StaffMember save(StaffMember staffMember);
    Optional<StaffMember> findById(UUID id);
    List<StaffMember> findByInstitutionId(UUID institutionId);
    List<StaffMember> findByFilters(UUID institutionId, UUID campusId, String category, String status, String search);
    long countByInstitutionId(UUID institutionId);
    boolean existsByInstitutionIdAndEmail(UUID institutionId, String email);
}
