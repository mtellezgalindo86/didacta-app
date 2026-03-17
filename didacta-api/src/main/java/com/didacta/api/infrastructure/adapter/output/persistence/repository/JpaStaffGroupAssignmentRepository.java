package com.didacta.api.infrastructure.adapter.output.persistence.repository;

import com.didacta.api.domain.model.StaffGroupAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JpaStaffGroupAssignmentRepository extends JpaRepository<StaffGroupAssignment, UUID> {

    List<StaffGroupAssignment> findByStaffMemberId(UUID staffMemberId);

    List<StaffGroupAssignment> findByGroupId(UUID groupId);

    boolean existsByStaffMemberIdAndGroupId(UUID staffMemberId, UUID groupId);
}
