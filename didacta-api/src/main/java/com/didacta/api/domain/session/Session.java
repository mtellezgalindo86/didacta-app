package com.didacta.api.domain.session;

import com.didacta.api.common.BaseTenantEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "sessions")
@Getter
@Setter
public class Session extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
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

    public enum SessionStatus {
        DRAFT, COMPLETED
    }
}
