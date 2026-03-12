package com.didacta.api.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;


import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class OnboardingCommand {

    @Data
    public static class CreateInstitution {
        @NotBlank
        private String name;
        @NotBlank
        private String mainLevel;
        private String country;
        private String timezone;
        @NotBlank
        @Pattern(regexp = "OWNER|DIRECTOR|COORDINATOR|TEACHER", message = "must be one of: OWNER, DIRECTOR, COORDINATOR, TEACHER")
        private String role;
        private boolean hasMultipleCampuses;
        private String campusName;
    }

    @Data
    public static class CreateGroup {
        @NotBlank
        private String name;
        private String gradeLevel;
        private String shift;
        private UUID campusId;
    }

    @Data
    public static class CreateStudents {
        @NotNull
        private UUID groupId;
        @NotEmpty
        @Valid
        private List<StudentEntry> students;
    }

    @Data
    public static class StudentEntry {
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
    }

    @Data
    public static class CreateAttendance {
        @NotNull
        private UUID groupId;
        @NotNull
        private LocalDate date;
        @NotEmpty
        @Valid
        private List<AttendanceEntry> entries;
    }

    @Data
    public static class AttendanceEntry {
        @NotNull
        private UUID studentId;
        @NotBlank
        @Pattern(regexp = "PRESENT|ABSENT|LATE|EXCUSED", message = "must be one of: PRESENT, ABSENT, LATE, EXCUSED")
        private String status;
    }

    @Data
    public static class CreateCollaborators {
        @NotEmpty
        @Valid
        private List<CollaboratorEntry> collaborators;
    }

    @Data
    public static class CollaboratorEntry {
        @NotBlank
        @Email
        private String email;
        @NotBlank
        private String fullName;
        @NotBlank
        @Pattern(regexp = "OWNER|DIRECTOR|COORDINATOR|TEACHER", message = "must be one of: OWNER, DIRECTOR, COORDINATOR, TEACHER")
        private String role;
        private UUID groupId;
    }

    @Data
    public static class CreateSession {
        @NotBlank
        private String title;
        private String notes;
        @NotNull
        private UUID groupId;
        private LocalDate sessionDate;
        @Pattern(regexp = "DAILY_REPORT|CLASS|FREE_FORM", message = "must be one of: DAILY_REPORT, CLASS, FREE_FORM")
        private String sessionType;
        private String subject;
    }
}
