package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.Guardian;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GuardianRepositoryPort {
    Guardian save(Guardian guardian);
    Optional<Guardian> findById(UUID id);
    Optional<Guardian> findByInstitutionIdAndPhone(UUID institutionId, String phone);
    List<Guardian> findByInstitutionId(UUID institutionId);
    List<Guardian> findByFilters(UUID institutionId, String status, String search);
    long countByInstitutionId(UUID institutionId);
    boolean existsByInstitutionIdAndPhoneAndIdNot(UUID institutionId, String phone, UUID id);
    void deleteById(UUID id);
}
