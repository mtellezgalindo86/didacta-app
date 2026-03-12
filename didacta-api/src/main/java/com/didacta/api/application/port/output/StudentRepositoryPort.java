package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.Student;

import java.util.List;
import java.util.UUID;

public interface StudentRepositoryPort {
    List<Student> findByGroupId(UUID groupId);
    List<Student> findByInstitutionId(UUID institutionId);
    boolean existsByIdAndInstitutionId(UUID id, UUID institutionId);
    Student save(Student student);
}
