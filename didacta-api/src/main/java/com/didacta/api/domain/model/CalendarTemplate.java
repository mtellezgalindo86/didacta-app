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
@Table(name = "calendar_templates")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarTemplate {

    @Id
    @GeneratedValue(generator = "uuid7")
    @org.hibernate.annotations.GenericGenerator(name = "uuid7", type = com.didacta.api.domain.common.UuidV7Generator.class)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "year_label", nullable = false, length = 20)
    private String yearLabel;

    @Column(name = "period_type", nullable = false, length = 20)
    private String periodType;

    @Column(nullable = false, length = 30)
    private String authority;

    @Column(name = "applicable_levels", columnDefinition = "TEXT")
    private String applicableLevels;

    @Column(name = "requires_accreditation", nullable = false)
    private Boolean requiresAccreditation;

    @Column(name = "accreditation_authority", length = 30)
    private String accreditationAuthority;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "expected_class_days")
    private Integer expectedClassDays;

    @Column(nullable = false)
    private Boolean active;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
