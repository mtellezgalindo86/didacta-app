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
    public List<Student> findByInstitutionIdAndFilters(UUID institutionId, String status, String search, UUID groupId) {
        return jpaRepo.findByFilters(institutionId, status, search, groupId);
    }

    @Override
    public long countByInstitutionId(UUID institutionId) {
        return jpaRepo.countByInstitutionId(institutionId);
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }

    @Override
    public Student save(Student student) {
        return jpaRepo.save(student);
    }
}
