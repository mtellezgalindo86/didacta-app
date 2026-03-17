package com.didacta.api.domain.model;

import com.didacta.api.domain.common.BaseTenantEntity;
import com.didacta.api.domain.common.UuidV7Generator;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "staff_member")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class StaffMember extends BaseTenantEntity {

    @Id
    @GeneratedValue(generator = "uuid7")
    @GenericGenerator(name = "uuid7", type = UuidV7Generator.class)
    private UUID id;

    @Column(name = "institution_id", nullable = false)
    private UUID institutionId;

    @Column(name = "campus_id")
    private UUID campusId;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "job_title", length = 150)
    private String jobTitle;

    @Column(nullable = false, length = 30)
    private String category;

    @Column(length = 255)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(name = "requires_access", nullable = false)
    private Boolean requiresAccess;

    @Column(name = "app_user_id")
    private UUID appUserId;

    @Column(name = "invitation_status", length = 20)
    private String invitationStatus;

    @Column(nullable = false, length = 20)
    private String status;
}
