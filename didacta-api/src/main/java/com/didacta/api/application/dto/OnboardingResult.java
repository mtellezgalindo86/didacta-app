package com.didacta.api.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

public class OnboardingResult {

    @Data
    @Builder
    public static class MeResponse {
        private UserDto user;
        private TenantDto tenant;
        private OnboardingStatus onboarding;
        private SetupProgress setupProgress;
    }

    @Data
    @Builder
    public static class SetupProgress {
        private boolean hasGroup;
        private boolean hasStudents;
        private boolean hasAttendance;
        private boolean hasCollaborators;
        private int groupCount;
        private int studentCount;
        private int collaboratorCount;
        private String suggestedNextAction;
    }

    @Data
    @Builder
    public static class UserDto {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
    }

    @Data
    @Builder
    public static class TenantDto {
        private UUID institutionId;
        private String role;
        private String name;
    }

    @Data
    @Builder
    public static class OnboardingStatus {
        private boolean hasInstitution;
        private boolean hasGroup;
        private boolean hasStudents;
        private boolean hasAttendance;
        private boolean hasCollaborators;
        private String nextStep;
    }

    @Data
    @Builder
    public static class InstitutionCreated {
        private UUID institutionId;
        private String nextStep;
    }

    @Data
    @Builder
    public static class GroupCreated {
        private UUID groupId;
        private String nextStep;
    }

    @Data
    @Builder
    public static class StudentsCreated {
        private int created;
        private List<StudentDto> students;
        private String nextStep;
    }

    @Data
    @Builder
    public static class StudentDto {
        private UUID id;
        private String firstName;
        private String lastName;
        private String status;
        private UUID groupId;
        private String groupName;
    }

    @Data
    @Builder
    public static class AttendanceCreated {
        private int recorded;
        private UUID sessionId;
        private String nextStep;
    }

    @Data
    @Builder
    public static class CollaboratorsCreated {
        private int created;
        private String nextStep;
    }

    @Data
    @Builder
    public static class InstitutionLevel {
        private String level;
    }

    @Data
    @Builder
    public static class CampusDto {
        private UUID id;
        private String name;
        private String address;
    }

    @Data
    @Builder
    public static class GroupDto {
        private UUID id;
        private String name;
        private String gradeLevel;
        private String shift;
        private UUID sectionId;
    }

    @Data
    @Builder
    public static class AcademicSectionDto {
        private UUID id;
        private String level;
        private String accreditationType;
        private String accreditationKey;
    }

    @Data
    @Builder
    public static class SessionDto {
        private UUID id;
        private UUID groupId;
        private String title;
        private String notes;
        private String status;
        private String sessionDate;
        private String sessionType;
        private String subject;
    }
}
