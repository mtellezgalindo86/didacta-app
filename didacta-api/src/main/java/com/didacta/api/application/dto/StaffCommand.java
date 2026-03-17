package com.didacta.api.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;
import java.util.UUID;

public class StaffCommand {

    @Data
    public static class Create {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        private String jobTitle;
        @NotBlank
        @Pattern(regexp = "DOCENTE|COORDINACION|DIRECCION|ADMINISTRATIVO|ESPECIALISTA|APOYO")
        private String category;
        @Email private String email;
        private String phone;
        private UUID campusId;
        private Boolean requiresAccess = false;
        @Pattern(regexp = "DIRECTOR|COORDINATOR|TEACHER")
        private String systemRole;
        @Valid
        private List<GroupAssignmentEntry> groupAssignments;
    }

    @Data
    public static class Update {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        private String jobTitle;
        @NotBlank
        @Pattern(regexp = "DOCENTE|COORDINACION|DIRECCION|ADMINISTRATIVO|ESPECIALISTA|APOYO")
        private String category;
        @Email private String email;
        private String phone;
        private UUID campusId;
        private Boolean requiresAccess;
    }

    @Data
    public static class AssignGroup {
        @NotNull private UUID groupId;
        @NotBlank
        @Pattern(regexp = "HEAD_TEACHER|ASSISTANT|SPECIALIST|SUPERVISOR")
        private String assignmentRole;
    }

    @Data
    public static class ChangeStatus {
        @NotBlank
        @Pattern(regexp = "ACTIVE|INACTIVE")
        private String status;
    }

    @Data
    public static class GroupAssignmentEntry {
        @NotNull private UUID groupId;
        @NotBlank
        @Pattern(regexp = "HEAD_TEACHER|ASSISTANT|SPECIALIST|SUPERVISOR")
        private String assignmentRole;
    }
}
