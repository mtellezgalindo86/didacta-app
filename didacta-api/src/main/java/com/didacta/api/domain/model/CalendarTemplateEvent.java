package com.didacta.api.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "calendar_template_events")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarTemplateEvent {

    @Id
    @GeneratedValue(generator = "uuid7")
    @org.hibernate.annotations.GenericGenerator(name = "uuid7", type = com.didacta.api.domain.common.UuidV7Generator.class)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private CalendarTemplate template;

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

    @Column(name = "is_mandatory", nullable = false)
    private Boolean isMandatory;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
