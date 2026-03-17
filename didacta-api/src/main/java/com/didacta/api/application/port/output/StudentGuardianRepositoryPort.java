package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.StudentGuardian;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface StudentGuardianRepositoryPort {
    StudentGuardian save(StudentGuardian studentGuardian);
    Optional<StudentGuardian> findById(UUID id);
    List<StudentGuardian> findByStudentId(UUID studentId);
    List<StudentGuardian> findByGuardianId(UUID guardianId);
    boolean existsByStudentIdAndGuardianId(UUID studentId, UUID guardianId);
    long countByStudentId(UUID studentId);
    Map<UUID, Long> countByStudentIds(List<UUID> studentIds);
    void deleteById(UUID id);
}
