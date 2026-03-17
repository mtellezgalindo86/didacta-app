package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.StaffMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaStaffMemberRepository extends JpaRepository<StaffMember, UUID> {

    List<StaffMember> findByInstitutionId(UUID institutionId);

    long countByInstitutionId(UUID institutionId);

    boolean existsByInstitutionIdAndEmail(UUID institutionId, String email);

    @Query("SELECT s FROM StaffMember s WHERE s.institutionId = :instId " +
           "AND (:campusId IS NULL OR s.campusId = :campusId) " +
           "AND (:category IS NULL OR s.category = :category) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:search IS NULL OR LOWER(CONCAT(s.firstName, ' ', s.lastName, ' ', COALESCE(s.email, ''))) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<StaffMember> findByFilters(@Param("instId") UUID institutionId,
                                     @Param("campusId") UUID campusId,
                                     @Param("category") String category,
                                     @Param("status") String status,
                                     @Param("search") String search);
}
