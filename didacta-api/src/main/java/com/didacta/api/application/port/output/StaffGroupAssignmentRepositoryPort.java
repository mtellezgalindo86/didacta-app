package com.didacta.api.application.port.output;

import com.didacta.api.domain.model.StaffGroupAssignment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffGroupAssignmentRepositoryPort {
    StaffGroupAssignment save(StaffGroupAssignment assignment);
    Optional<StaffGroupAssignment> findById(UUID id);
    List<StaffGroupAssignment> findByStaffMemberId(UUID staffMemberId);
    List<StaffGroupAssignment> findByGroupId(UUID groupId);
    boolean existsByStaffMemberIdAndGroupId(UUID staffMemberId, UUID groupId);
    void deleteById(UUID id);
}
