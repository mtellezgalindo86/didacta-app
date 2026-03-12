package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JpaStudentRepository extends JpaRepository<Student, UUID> {
    List<Student> findByGroupId(UUID groupId);
    List<Student> findByInstitutionId(UUID institutionId);
    boolean existsByIdAndInstitutionId(UUID id, UUID institutionId);
}
