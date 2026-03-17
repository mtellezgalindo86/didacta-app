package com.didacta.api.application.port.input;

import com.didacta.api.application.dto.StaffCommand;
import com.didacta.api.application.dto.StaffResult;

import java.util.List;
import java.util.UUID;

public interface ManageStaffUseCase {
    StaffResult.StaffMemberCreated create(StaffCommand.Create command);
    StaffResult.StaffListResponse list(UUID campusId, String category, String status, String search);
    StaffResult.StaffMemberResponse getById(UUID staffMemberId);
    StaffResult.StaffMemberResponse update(UUID staffMemberId, StaffCommand.Update command);
    void changeStatus(UUID staffMemberId, StaffCommand.ChangeStatus command);
    List<StaffResult.AssignmentResponse> getAssignments(UUID staffMemberId);
    StaffResult.AssignmentResponse assignToGroup(UUID staffMemberId, StaffCommand.AssignGroup command);
    void removeAssignment(UUID staffMemberId, UUID assignmentId);
    void resendInvitation(UUID staffMemberId);
}
