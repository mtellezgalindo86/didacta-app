package com.didacta.api.application.mapper;

import com.didacta.api.application.dto.StaffResult;
import com.didacta.api.domain.model.StaffGroupAssignment;
import com.didacta.api.domain.model.StaffMember;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class StaffMapper {

    private StaffMapper() {}

    public static StaffResult.StaffMemberResponse toResponse(
            StaffMember staff,
            List<StaffGroupAssignment> assignments,
            Map<UUID, String> groupNames,
            Map<UUID, String> groupGrades,
            String campusName) {

        List<StaffResult.AssignmentResponse> assignmentResponses = assignments.stream()
                .map(a -> toAssignmentResponse(a, groupNames.getOrDefault(a.getGroupId(), ""), groupGrades.getOrDefault(a.getGroupId(), "")))
                .toList();

        return StaffResult.StaffMemberResponse.builder()
                .id(staff.getId())
                .firstName(staff.getFirstName())
                .lastName(staff.getLastName())
                .jobTitle(staff.getJobTitle())
                .category(staff.getCategory())
                .email(staff.getEmail())
                .phone(staff.getPhone())
                .campusId(staff.getCampusId())
                .campusName(campusName)
                .requiresAccess(staff.getRequiresAccess())
                .invitationStatus(staff.getInvitationStatus())
                .status(staff.getStatus())
                .assignments(assignmentResponses)
                .createdAt(staff.getCreatedAt())
                .build();
    }

    public static StaffResult.AssignmentResponse toAssignmentResponse(
            StaffGroupAssignment assignment, String groupName, String gradeLevel) {
        return StaffResult.AssignmentResponse.builder()
                .id(assignment.getId())
                .groupId(assignment.getGroupId())
                .groupName(groupName)
                .gradeLevel(gradeLevel)
                .assignmentRole(assignment.getAssignmentRole())
                .active(assignment.getActive())
                .build();
    }
}
