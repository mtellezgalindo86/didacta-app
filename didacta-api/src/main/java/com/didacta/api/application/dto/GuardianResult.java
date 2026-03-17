package com.didacta.api.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class GuardianResult {

    @Data @Builder
    public static class GuardianCreated {
        private UUID id;
        private boolean alreadyExisted;
    }

    @Data @Builder
    public static class GuardianResponse {
        private UUID id;
        private String firstName;
        private String lastName;
        private String phone;
        private String email;
        private String status;
        private List<StudentLinkResponse> students;
        private LocalDateTime createdAt;
    }

    @Data @Builder
    public static class GuardianListItem {
        private UUID id;
        private String firstName;
        private String lastName;
        private String phone;
        private String email;
        private String status;
        private int studentCount;
        private List<String> studentNames;
    }

    @Data @Builder
    public static class StudentLinkResponse {
        private UUID linkId;
        private UUID studentId;
        private String studentFirstName;
        private String studentLastName;
        private String groupName;
        private String relationship;
        private Boolean isPrimary;
        private Boolean canPickUp;
        private Boolean receivesNotifications;
        private String notes;
    }

    @Data @Builder
    public static class GuardianOfStudentResponse {
        private UUID guardianId;
        private String firstName;
        private String lastName;
        private String phone;
        private String email;
        private UUID linkId;
        private String relationship;
        private Boolean isPrimary;
        private Boolean canPickUp;
        private Boolean receivesNotifications;
        private String notes;
    }
}
