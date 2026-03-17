package com.didacta.api.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class StaffResult {

    @Data @Builder
    public static class StaffMemberResponse {
        private UUID id;
        private String firstName;
        private String lastName;
        private String jobTitle;
        private String category;
        private String email;
        private String phone;
        private UUID campusId;
        private String campusName;
        private Boolean requiresAccess;
        private String invitationStatus;
        private String status;
        private List<AssignmentResponse> assignments;
        private LocalDateTime createdAt;
    }

    @Data @Builder
    public static class StaffListResponse {
        private List<StaffMemberResponse> items;
        private long total;
    }

    @Data @Builder
    public static class AssignmentResponse {
        private UUID id;
        private UUID groupId;
        private String groupName;
        private String gradeLevel;
        private String assignmentRole;
        private Boolean active;
    }

    @Data @Builder
    public static class StaffMemberCreated {
        private UUID id;
        private String invitationStatus;
    }
}
