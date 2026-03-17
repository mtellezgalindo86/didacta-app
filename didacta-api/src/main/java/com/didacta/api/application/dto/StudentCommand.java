package com.didacta.api.application.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

public class StudentCommand {

    @Data
    public static class Create {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        @NotNull private UUID groupId;
        private LocalDate dateOfBirth;
    }

    @Data
    public static class Update {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        private LocalDate dateOfBirth;
    }

    @Data
    public static class ChangeGroup {
        @NotNull private UUID groupId;
    }

    @Data
    public static class ChangeStatus {
        @NotBlank
        @Pattern(regexp = "ACTIVE|INACTIVE")
        private String status;
    }
}
