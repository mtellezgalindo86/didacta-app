package com.didacta.api.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

public class AcademicSectionDto {

    @Data
    public static class CreateSection {
        @NotBlank
        @Pattern(regexp = "MATERNAL|INICIAL|PREESCOLAR|PRIMARIA|SECUNDARIA|MEDIA_SUPERIOR|EMPRESARIAL",
                message = "must be a valid education level")
        private String level;

        @NotBlank
        @Pattern(regexp = "NONE|SEP_RVOE|UNAM_DGIRE|IPN|OTHER",
                message = "must be a valid accreditation type")
        private String accreditationType;

        private String accreditationKey;
        private String name;
    }

    @Data
    @Builder
    public static class Response {
        private UUID id;
        private String level;
        private String accreditationType;
        private String accreditationKey;
        private String name;
        private Integer displayOrder;
        private Boolean active;
    }
}
