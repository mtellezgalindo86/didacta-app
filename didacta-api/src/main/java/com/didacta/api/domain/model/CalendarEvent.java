package com.didacta.api.domain.model;

import com.didacta.api.domain.common.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "calendar_events")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEvent extends BaseTenantEntity {

    @Id
    @GeneratedValue(generator = "uuid7")
    @org.hibernate.annotations.GenericGenerator(name = "uuid7", type = com.didacta.api.domain.common.UuidV7Generator.class)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calendar_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private InstitutionCalendar calendar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_template_event_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private CalendarTemplateEvent sourceTemplateEvent;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "event_type", nullable = false, length = 30)
    private String eventType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "affects_classes", nullable = false)
    private Boolean affectsClasses;

    @Column(name = "affects_staff", nullable = false)
    private Boolean affectsStaff;

    @Column(name = "is_from_template", nullable = false)
    private Boolean isFromTemplate;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
