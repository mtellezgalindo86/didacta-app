package com.didacta.api.infrastructure.adapter.output.persistence.adapter;

import com.didacta.api.application.port.output.StaffGroupAssignmentRepositoryPort;
import com.didacta.api.domain.model.StaffGroupAssignment;
import com.didacta.api.infrastructure.adapter.output.persistence.repository.JpaStaffGroupAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StaffGroupAssignmentPersistenceAdapter implements StaffGroupAssignmentRepositoryPort {

    private final JpaStaffGroupAssignmentRepository jpaRepo;

    @Override
    public StaffGroupAssignment save(StaffGroupAssignment assignment) {
        return jpaRepo.save(assignment);
    }

    @Override
    public Optional<StaffGroupAssignment> findById(UUID id) {
        return jpaRepo.findById(id);
    }

    @Override
    public List<StaffGroupAssignment> findByStaffMemberId(UUID staffMemberId) {
        return jpaRepo.findByStaffMemberId(staffMemberId);
    }

    @Override
    public List<StaffGroupAssignment> findByGroupId(UUID groupId) {
        return jpaRepo.findByGroupId(groupId);
    }

    @Override
    public boolean existsByStaffMemberIdAndGroupId(UUID staffMemberId, UUID groupId) {
        return jpaRepo.existsByStaffMemberIdAndGroupId(staffMemberId, groupId);
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepo.deleteById(id);
    }
}
