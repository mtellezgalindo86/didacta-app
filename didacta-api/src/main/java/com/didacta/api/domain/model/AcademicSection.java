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
@Table(name = "academic_sections")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicSection extends BaseTenantEntity {

    @Id
    @GeneratedValue(generator = "uuid7")
    @org.hibernate.annotations.GenericGenerator(name = "uuid7", type = com.didacta.api.domain.common.UuidV7Generator.class)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Institution institution;

    @Column(nullable = false, length = 30)
    private String level;

    @Column(name = "accreditation_type", nullable = false, length = 30)
    private String accreditationType;

    @Column(name = "accreditation_key", length = 100)
    private String accreditationKey;

    @Column(length = 100)
    private String name;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(nullable = false)
    private Boolean active;
}
