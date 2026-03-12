package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface JpaAttendanceRepository extends JpaRepository<Attendance, UUID> {
    boolean existsByInstitutionId(UUID institutionId);
    List<Attendance> findByGroupIdAndAttendanceDate(UUID groupId, LocalDate date);
}
