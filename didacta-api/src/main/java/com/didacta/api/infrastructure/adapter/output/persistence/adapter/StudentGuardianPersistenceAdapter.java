package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.StudentGuardianRepositoryPort;
import com.didacta.api.domain.model.StudentGuardian;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaStudentGuardianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StudentGuardianPersistenceAdapter implements StudentGuardianRepositoryPort {

    private final JpaStudentGuardianRepository jpaRepo;

    @Override
    public StudentGuardian save(StudentGuardian studentGuardian) {
        return jpaRepo.save(studentGuardian);
    }

    @Override
    public Optional<StudentGuardian> findById(UUID id) {
        return jpaRepo.findById(id);
    }

    @Override
    public List<StudentGuardian> findByStudentId(UUID studentId) {
        return jpaRepo.findByStudentId(studentId);
    }

    @Override
    public List<StudentGuardian> findByGuardianId(UUID guardianId) {
        return jpaRepo.findByGuardianId(guardianId);
    }

    @Override
    public boolean existsByStudentIdAndGuardianId(UUID studentId, UUID guardianId) {
        return jpaRepo.existsByStudentIdAndGuardianId(studentId, guardianId);
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }
}
