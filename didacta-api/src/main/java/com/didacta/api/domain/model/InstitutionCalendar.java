package com.didacta.api.domain.model;

import com.didacta.api.domain.common.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.UUID;

@Entity
@Table(name = "institution_calendars")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionCalendar extends BaseTenantEntity {

    @Id
    @GeneratedValue(generator = "uuid7")
    @org.hibernate.annotations.GenericGenerator(name = "uuid7", type = com.didacta.api.domain.common.UuidV7Generator.class)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private AcademicSection section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_year_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private SchoolYear schoolYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_template_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private CalendarTemplate sourceTemplate;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 20)
    private String status;
}
