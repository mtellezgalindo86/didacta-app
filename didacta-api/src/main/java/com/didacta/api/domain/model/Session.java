package com.didacta.api.domain.model;

import com.didacta.api.domain.common.BaseTenantEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sessions")
@Getter
@Setter
public class Session extends BaseTenantEntity {

    @Id
    @GeneratedValue(generator = "uuid7")
    @org.hibernate.annotations.GenericGenerator(name = "uuid7", type = com.didacta.api.domain.common.UuidV7Generator.class)
    private UUID id;

    @Column(name = "group_id")
    private UUID groupId;

    @NotBlank
    private String title;

    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.DRAFT;

    @Column(name = "session_date")
    private LocalDate sessionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false)
    private SessionType sessionType = SessionType.FREE_FORM;

    @Column
    private String subject;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "facilitator_id")
    private UUID facilitatorId;

    public enum SessionStatus {
        DRAFT, COMPLETED
    }

    public enum SessionType {
        DAILY_REPORT, CLASS, FREE_FORM
    }
}
