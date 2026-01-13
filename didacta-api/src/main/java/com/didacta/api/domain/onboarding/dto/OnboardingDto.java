package com.didacta.api.domain.onboarding.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

public class OnboardingDto {

    @Data
    @Builder
    public static class MeResponse {
        private UserDto user;
        private TenantDto tenant;
        private OnboardingStatus onboarding;
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
        private boolean hasCollaborators;
        private String nextStep; // STEP_1, STEP_2, STEP_3, DONE
    }

    @Data
    public static class CreateInstitutionRequest {
        private String name;
        private String mainLevel;
        private String country;
        private String timezone;
        private String role; // Role of the creator
    }

    @Data
    @Builder
    public static class InstitutionCreatedResponse {
        private UUID institutionId;
        private String nextStep;
    }

    @Data
    public static class CreateGroupRequest {
        private String name;
        private String gradeLevel;
        private String shift;
    }

    @Data
    @Builder
    public static class GroupCreatedResponse {
        private UUID groupId;
        private String nextStep;
    }

    @Data
    public static class CreateCollaboratorsRequest {
        private java.util.List<CollaboratorRequest> collaborators;
    }

    @Data
    public static class CollaboratorRequest {
        private String email;
        private String fullName;
        private String role;
        private UUID groupId;
    }

    @Data
    @Builder
    public static class CollaboratorsCreatedResponse {
        private int created;
        private String nextStep;
    }
}
