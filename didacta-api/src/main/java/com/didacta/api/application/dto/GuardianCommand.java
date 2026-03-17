package com.didacta.api.application.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.UUID;

public class GuardianCommand {

    @Data
    public static class Create {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        @NotBlank private String phone;
        @Email private String email;
        @NotNull private UUID studentId;
        @NotBlank
        @Pattern(regexp = "MOTHER|FATHER|GRANDFATHER|GRANDMOTHER|UNCLE|AUNT|SIBLING|TUTOR|OTHER")
        private String relationship;
        private Boolean isPrimary = false;
        private Boolean canPickUp = true;
        private Boolean receivesNotifications = true;
    }

    @Data
    public static class Update {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        @NotBlank private String phone;
        @Email private String email;
    }

    @Data
    public static class LinkStudent {
        @NotNull private UUID studentId;
        @NotBlank
        @Pattern(regexp = "MOTHER|FATHER|GRANDFATHER|GRANDMOTHER|UNCLE|AUNT|SIBLING|TUTOR|OTHER")
        private String relationship;
        private Boolean isPrimary = false;
        private Boolean canPickUp = true;
        private Boolean receivesNotifications = true;
        private String notes;
    }

    @Data
    public static class UpdateLink {
        @Pattern(regexp = "MOTHER|FATHER|GRANDFATHER|GRANDMOTHER|UNCLE|AUNT|SIBLING|TUTOR|OTHER")
        private String relationship;
        private Boolean isPrimary;
        private Boolean canPickUp;
        private Boolean receivesNotifications;
        private String notes;
    }

    @Data
    public static class ChangeStatus {
        @NotBlank
        @Pattern(regexp = "ACTIVE|INACTIVE")
        private String status;
    }
}
