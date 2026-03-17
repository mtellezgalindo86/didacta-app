-- Guardian table
CREATE TABLE guardian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institution(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    app_user_id UUID REFERENCES app_user(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX idx_guardian_institution ON guardian(institution_id);
CREATE INDEX idx_guardian_tenant ON guardian(tenant_id);
CREATE INDEX idx_guardian_app_user ON guardian(app_user_id);
CREATE INDEX idx_guardian_status ON guardian(tenant_id, status);
CREATE UNIQUE INDEX idx_guardian_institution_phone ON guardian(institution_id, phone);

-- Student-Guardian relationship table
CREATE TABLE student_guardian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES student(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES guardian(id) ON DELETE CASCADE,
    relationship VARCHAR(30) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    can_pick_up BOOLEAN NOT NULL DEFAULT true,
    receives_notifications BOOLEAN NOT NULL DEFAULT true,
    notes VARCHAR(500),
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    CONSTRAINT uq_student_guardian UNIQUE (student_id, guardian_id)
);

CREATE INDEX idx_student_guardian_tenant ON student_guardian(tenant_id);
CREATE INDEX idx_student_guardian_student ON student_guardian(student_id);
CREATE INDEX idx_student_guardian_guardian ON student_guardian(guardian_id);

-- Migrate legacy guardian data from student table
INSERT INTO guardian (
    id, institution_id, first_name, last_name, phone, email, status, tenant_id, created_at
)
SELECT
    gen_random_uuid(),
    s.institution_id,
    COALESCE(
        CASE WHEN position(' ' IN TRIM(s.guardian_name)) > 0
             THEN left(TRIM(s.guardian_name), position(' ' IN TRIM(s.guardian_name)) - 1)
             ELSE TRIM(s.guardian_name) END,
        ''
    ),
    COALESCE(
        CASE WHEN position(' ' IN TRIM(s.guardian_name)) > 0
             THEN substring(TRIM(s.guardian_name) FROM position(' ' IN TRIM(s.guardian_name)) + 1)
             ELSE '' END,
        ''
    ),
    s.guardian_phone,
    s.guardian_email,
    'ACTIVE',
    s.institution_id::varchar,
    now()
FROM (
    SELECT DISTINCT ON (institution_id, guardian_phone)
        institution_id, guardian_name, guardian_phone, guardian_email
    FROM student
    WHERE guardian_phone IS NOT NULL AND guardian_phone != ''
    ORDER BY institution_id, guardian_phone, created_at ASC
) s;

-- Link students to their migrated guardians
INSERT INTO student_guardian (
    id, student_id, guardian_id, relationship, is_primary,
    can_pick_up, receives_notifications, tenant_id, created_at
)
SELECT
    gen_random_uuid(),
    s.id,
    g.id,
    'TUTOR',
    true,
    true,
    true,
    s.institution_id::varchar,
    now()
FROM student s
INNER JOIN guardian g
    ON g.institution_id = s.institution_id
    AND g.phone = s.guardian_phone
WHERE s.guardian_phone IS NOT NULL AND s.guardian_phone != '';
