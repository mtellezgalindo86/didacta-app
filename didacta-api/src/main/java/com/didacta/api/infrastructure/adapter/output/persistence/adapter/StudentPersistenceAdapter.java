package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.StudentRepositoryPort;
import com.didacta.api.domain.model.Student;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaStudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StudentPersistenceAdapter implements StudentRepositoryPort {

    private final JpaStudentRepository jpaRepo;

    @Override
    public List<Student> findByGroupId(UUID groupId) {
        return jpaRepo.findByGroupId(groupId);
    }

    @Override
    public List<Student> findByInstitutionId(UUID institutionId) {
        return jpaRepo.findByInstitutionId(institutionId);
    }

    @Override
    public Optional<Student> findById(UUID id) {
        return jpaRepo.findById(id);
    }

    @Override
    public boolean existsByIdAndInstitutionId(UUID id, UUID institutionId) {
        return jpaRepo.existsByIdAndInstitutionId(id, institutionId);
    }

    @Override
    public Student save(Student student) {
        return jpaRepo.save(student);
    }
}
