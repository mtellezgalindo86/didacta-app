package com.didacta.api.domain.model;

import com.didacta.api.domain.common.BaseTenantEntity;
import com.didacta.api.domain.common.UuidV7Generator;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;

@Entity
@Table(name = "student_guardian")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class StudentGuardian extends BaseTenantEntity {

    @Id
    @GeneratedValue(generator = "uuid7")
    @GenericGenerator(name = "uuid7", type = UuidV7Generator.class)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "guardian_id", nullable = false)
    private UUID guardianId;

    @Column(nullable = false, length = 30)
    private String relationship;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary;

    @Column(name = "can_pick_up", nullable = false)
    private Boolean canPickUp;

    @Column(name = "receives_notifications", nullable = false)
    private Boolean receivesNotifications;

    @Column(length = 500)
    private String notes;
}
