package com.didacta.api.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

public class StudentResult {

    @Data @Builder
    public static class StudentResponse {
        private UUID id;
        private String firstName;
        private String lastName;
        private LocalDate dateOfBirth;
        private String status;
        private UUID groupId;
        private String groupName;
        private LocalDate enrollmentDate;
        private String createdAt;
    }

    @Data @Builder
    public static class StudentListItem {
        private UUID id;
        private String firstName;
        private String lastName;
        private String status;
        private UUID groupId;
        private String groupName;
        private int guardianCount;
    }
}
