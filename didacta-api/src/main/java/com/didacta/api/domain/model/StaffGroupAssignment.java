package com.didacta.api.domain.model;

import com.didacta.api.domain.common.BaseTenantEntity;
import com.didacta.api.domain.common.UuidV7Generator;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "staff_group_assignment")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class StaffGroupAssignment extends BaseTenantEntity {

    @Id
    @GeneratedValue(generator = "uuid7")
    @GenericGenerator(name = "uuid7", type = UuidV7Generator.class)
    private UUID id;

    @Column(name = "staff_member_id", nullable = false)
    private UUID staffMemberId;

    @Column(name = "group_id", nullable = false)
    private UUID groupId;

    @Column(name = "assignment_role", nullable = false, length = 30)
    private String assignmentRole;

    @Column(nullable = false)
    private Boolean active;
}
