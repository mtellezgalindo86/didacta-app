package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.Guardian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaGuardianRepository extends JpaRepository<Guardian, UUID> {

    Optional<Guardian> findByInstitutionIdAndPhone(UUID institutionId, String phone);

    List<Guardian> findByInstitutionId(UUID institutionId);

    long countByInstitutionId(UUID institutionId);

    boolean existsByInstitutionIdAndPhoneAndIdNot(UUID institutionId, String phone, UUID id);

    @Query("SELECT g FROM Guardian g WHERE g.institutionId = :instId " +
           "AND (:status IS NULL OR g.status = :status) " +
           "AND (:search IS NULL OR LOWER(CONCAT(g.firstName, ' ', g.lastName, ' ', COALESCE(g.phone, ''), ' ', COALESCE(g.email, ''))) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Guardian> findByFilters(@Param("instId") UUID institutionId,
                                 @Param("status") String status,
                                 @Param("search") String search);
}
