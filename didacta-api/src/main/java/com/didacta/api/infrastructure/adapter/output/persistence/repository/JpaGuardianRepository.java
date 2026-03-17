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
           "AND (CAST(:search AS STRING) IS NULL " +
           "OR LOWER(g.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS STRING), '%')) " +
           "OR LOWER(g.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS STRING), '%')) " +
           "OR LOWER(g.phone) LIKE LOWER(CONCAT('%', CAST(:search AS STRING), '%')) " +
           "OR (g.email IS NOT NULL AND LOWER(g.email) LIKE LOWER(CONCAT('%', CAST(:search AS STRING), '%'))))")
    List<Guardian> findByFilters(@Param("instId") UUID institutionId,
                                 @Param("status") String status,
                                 @Param("search") String search);
}
