package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.Student;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentRepositoryPort {
    List<Student> findByGroupId(UUID groupId);
    List<Student> findByInstitutionId(UUID institutionId);
    Optional<Student> findById(UUID id);
    boolean existsByIdAndInstitutionId(UUID id, UUID institutionId);
    List<Student> findByInstitutionIdAndFilters(UUID institutionId, String status, String search, UUID groupId);
    long countByInstitutionId(UUID institutionId);
    void deleteById(UUID id);
    Student save(Student student);
}
