CREATE TABLE staff_member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institution(id),
    campus_id UUID REFERENCES campus(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(150),
    category VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    requires_access BOOLEAN NOT NULL DEFAULT false,
    app_user_id UUID REFERENCES app_user(id),
    invitation_status VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX idx_staff_member_institution ON staff_member(institution_id);
CREATE INDEX idx_staff_member_campus ON staff_member(campus_id);
CREATE INDEX idx_staff_member_tenant ON staff_member(tenant_id);
CREATE INDEX idx_staff_member_category ON staff_member(tenant_id, category);
CREATE INDEX idx_staff_member_status ON staff_member(tenant_id, status);
CREATE INDEX idx_staff_member_app_user ON staff_member(app_user_id);
CREATE UNIQUE INDEX idx_staff_member_institution_email
    ON staff_member(institution_id, email) WHERE email IS NOT NULL;

CREATE TABLE staff_group_assignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_member_id UUID NOT NULL REFERENCES staff_member(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES group_entity(id),
    assignment_role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    CONSTRAINT uq_staff_group UNIQUE (staff_member_id, group_id)
);

CREATE INDEX idx_staff_group_assignment_tenant ON staff_group_assignment(tenant_id);
CREATE INDEX idx_staff_group_assignment_group ON staff_group_assignment(group_id);
CREATE INDEX idx_staff_group_assignment_staff ON staff_group_assignment(staff_member_id);

-- Migrate existing CollaboratorPreUser to StaffMember
INSERT INTO staff_member (
    id, institution_id, first_name, last_name, email, category,
    requires_access, invitation_status, status, tenant_id, created_at
)
SELECT
    gen_random_uuid(),
    cp.institution_id,
    COALESCE(
        CASE WHEN position(' ' IN cp.full_name) > 0
             THEN left(cp.full_name, position(' ' IN cp.full_name) - 1)
             ELSE cp.full_name END,
        ''
    ),
    COALESCE(
        CASE WHEN position(' ' IN cp.full_name) > 0
             THEN substring(cp.full_name FROM position(' ' IN cp.full_name) + 1)
             ELSE '' END,
        ''
    ),
    cp.email,
    CASE cp.role
        WHEN 'TEACHER' THEN 'DOCENTE'
        WHEN 'COORDINATOR' THEN 'COORDINACION'
        ELSE 'ADMINISTRATIVO'
    END,
    true,
    CASE cp.status
        WHEN 'ACTIVE' THEN 'ACCEPTED'
        WHEN 'PENDING' THEN 'PENDING'
        ELSE 'PENDING'
    END,
    'ACTIVE',
    cp.institution_id::varchar,
    cp.created_at
FROM collaborator_preuser cp
WHERE cp.status IN ('PENDING', 'ACTIVE');

-- Migrate group assignments
INSERT INTO staff_group_assignment (
    id, staff_member_id, group_id, assignment_role, active, tenant_id, created_at
)
SELECT
    gen_random_uuid(),
    sm.id,
    cp.group_id,
    CASE cp.role
        WHEN 'TEACHER' THEN 'HEAD_TEACHER'
        WHEN 'COORDINATOR' THEN 'SUPERVISOR'
        ELSE 'ASSISTANT'
    END,
    true,
    sm.tenant_id,
    cp.created_at
FROM collaborator_preuser cp
INNER JOIN staff_member sm ON sm.email = cp.email
    AND sm.institution_id = cp.institution_id
WHERE cp.group_id IS NOT NULL
  AND cp.status IN ('PENDING', 'ACTIVE');
