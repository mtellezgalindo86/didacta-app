package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.AttendanceRepositoryPort;
import com.didacta.api.domain.model.Attendance;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaAttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AttendancePersistenceAdapter implements AttendanceRepositoryPort {

    private final JpaAttendanceRepository jpaRepo;

    @Override
    public boolean existsByInstitutionId(UUID institutionId) {
        return jpaRepo.existsByInstitutionId(institutionId);
    }

    @Override
    public List<Attendance> findByGroupIdAndAttendanceDate(UUID groupId, LocalDate date) {
        return jpaRepo.findByGroupIdAndAttendanceDate(groupId, date);
    }

    @Override
    public Attendance save(Attendance attendance) {
        return jpaRepo.save(attendance);
    }
}
