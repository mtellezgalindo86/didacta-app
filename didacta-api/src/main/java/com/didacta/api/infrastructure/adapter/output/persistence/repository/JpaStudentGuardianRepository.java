package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.StudentGuardian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaStudentGuardianRepository extends JpaRepository<StudentGuardian, UUID> {

    List<StudentGuardian> findByStudentId(UUID studentId);

    List<StudentGuardian> findByGuardianId(UUID guardianId);

    boolean existsByStudentIdAndGuardianId(UUID studentId, UUID guardianId);

    long countByStudentId(UUID studentId);

    @Query("SELECT sg.studentId, COUNT(sg) FROM StudentGuardian sg WHERE sg.studentId IN :studentIds GROUP BY sg.studentId")
    List<Object[]> countGroupedByStudentIds(@Param("studentIds") List<UUID> studentIds);
}
