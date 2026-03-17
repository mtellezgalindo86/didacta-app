package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.StudentGuardianRepositoryPort;
import com.didacta.api.domain.model.StudentGuardian;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaStudentGuardianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    public long countByStudentId(UUID studentId) {
        return jpaRepo.countByStudentId(studentId);
    }

    @Override
    public Map<UUID, Long> countByStudentIds(List<UUID> studentIds) {
        if (studentIds.isEmpty()) {
            return new HashMap<>();
        }
        List<Object[]> results = jpaRepo.countGroupedByStudentIds(studentIds);
        Map<UUID, Long> map = new HashMap<>();
        for (Object[] row : results) {
            map.put((UUID) row[0], (Long) row[1]);
        }
        return map;
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }
}
