package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.Attendance;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AttendanceRepositoryPort {
    boolean existsByInstitutionId(UUID institutionId);
    List<Attendance> findByGroupIdAndAttendanceDate(UUID groupId, LocalDate date);
    Attendance save(Attendance attendance);
}
