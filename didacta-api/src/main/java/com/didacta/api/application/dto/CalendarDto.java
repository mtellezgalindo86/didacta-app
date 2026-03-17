package com.didacta.api.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class CalendarDto {

    // --- Commands ---

    @Data
    public static class CreateFromTemplate {
        @NotNull
        private UUID templateId;
        private UUID sectionId;
    }

    @Data
    public static class CreateEvent {
        @NotBlank
        private String name;
        @NotBlank
        private String eventType;
        @NotNull
        private LocalDate startDate;
        @NotNull
        private LocalDate endDate;
        private Boolean affectsClasses;
        private Boolean affectsStaff;
        private String notes;
    }

    @Data
    public static class UpdateEvent {
        private String name;
        private String eventType;
        private LocalDate startDate;
        private LocalDate endDate;
        private Boolean affectsClasses;
        private Boolean affectsStaff;
        private String notes;
    }

    // --- Responses ---

    @Data
    @Builder
    public static class TemplateResponse {
        private UUID id;
        private String code;
        private String name;
        private String description;
        private String yearLabel;
        private String periodType;
        private String authority;
        private String applicableLevels;
        private Boolean requiresAccreditation;
        private String accreditationAuthority;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer expectedClassDays;
    }

    @Data
    @Builder
    public static class TemplateDetailResponse {
        private TemplateResponse template;
        private List<TemplateEventResponse> events;
    }

    @Data
    @Builder
    public static class TemplateEventResponse {
        private UUID id;
        private String name;
        private String eventType;
        private LocalDate startDate;
        private LocalDate endDate;
        private Boolean affectsClasses;
        private Boolean affectsStaff;
        private Boolean isMandatory;
        private Integer sortOrder;
    }

    @Data
    @Builder
    public static class CalendarResponse {
        private UUID id;
        private UUID sectionId;
        private String sectionLevel;
        private UUID schoolYearId;
        private UUID sourceTemplateId;
        private String name;
        private String status;
    }

    @Data
    @Builder
    public static class CalendarDetailResponse {
        private CalendarResponse calendar;
        private List<EventResponse> events;
    }

    @Data
    @Builder
    public static class EventResponse {
        private UUID id;
        private String name;
        private String eventType;
        private LocalDate startDate;
        private LocalDate endDate;
        private Boolean affectsClasses;
        private Boolean affectsStaff;
        private Boolean isFromTemplate;
        private Boolean isDeleted;
        private String notes;
    }
}
