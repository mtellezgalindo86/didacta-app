package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaStudentRepository extends JpaRepository<Student, UUID> {
    List<Student> findByGroupId(UUID groupId);
    List<Student> findByInstitutionId(UUID institutionId);
    boolean existsByIdAndInstitutionId(UUID id, UUID institutionId);
    long countByInstitutionId(UUID institutionId);

    @Query("SELECT s FROM Student s WHERE s.institutionId = :instId " +
           "AND (CAST(:status AS STRING) IS NULL OR s.status = :status) " +
           "AND (CAST(:groupId AS STRING) IS NULL OR CAST(s.groupId AS STRING) = CAST(:groupId AS STRING)) " +
           "AND (CAST(:search AS STRING) IS NULL " +
           "OR LOWER(s.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS STRING), '%')) " +
           "OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS STRING), '%')))")
    List<Student> findByFilters(@Param("instId") UUID institutionId,
                                @Param("status") String status,
                                @Param("search") String search,
                                @Param("groupId") UUID groupId);
}
