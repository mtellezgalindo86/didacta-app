-- =============================================
-- V4: EduFlow 360 - school_year, student, attendance + session improvements
-- =============================================

-- 1. School Year
CREATE TABLE school_year (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institution(id),
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_school_year_institution ON school_year(institution_id);
CREATE UNIQUE INDEX idx_school_year_institution_name ON school_year(institution_id, name);

-- 2. Student
CREATE TABLE student (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institution(id),
    group_id UUID NOT NULL REFERENCES group_entity(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    guardian_name VARCHAR(255),
    guardian_phone VARCHAR(50),
    guardian_email VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    enrollment_date DATE NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255)
);

CREATE INDEX idx_student_institution ON student(institution_id);
CREATE INDEX idx_student_group ON student(group_id);
CREATE INDEX idx_student_tenant ON student(tenant_id);

-- 3. Attendance
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student(id),
    group_id UUID NOT NULL REFERENCES group_entity(id),
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    check_in_time TIME,
    notes VARCHAR(500),
    recorded_by UUID REFERENCES app_user(id),
    institution_id UUID NOT NULL REFERENCES institution(id),
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_attendance_student_date UNIQUE (student_id, attendance_date)
);

CREATE INDEX idx_attendance_group_date ON attendance(group_id, attendance_date);
CREATE INDEX idx_attendance_tenant ON attendance(tenant_id);

-- 4. Alter sessions - add new columns
ALTER TABLE sessions ADD COLUMN session_type VARCHAR(30) NOT NULL DEFAULT 'FREE_FORM';
ALTER TABLE sessions ADD COLUMN subject VARCHAR(255);
ALTER TABLE sessions ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE sessions ADD COLUMN facilitator_id UUID REFERENCES app_user(id);

-- 5. Create default school_year for existing institutions
INSERT INTO school_year (id, institution_id, name, start_date, end_date, status, created_at)
SELECT
    gen_random_uuid(),
    id,
    CASE
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 8
            THEN EXTRACT(YEAR FROM CURRENT_DATE) || '-' || (EXTRACT(YEAR FROM CURRENT_DATE) + 1)
        ELSE (EXTRACT(YEAR FROM CURRENT_DATE) - 1) || '-' || EXTRACT(YEAR FROM CURRENT_DATE)
    END,
    CASE
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 8
            THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, 8, 1)
        ELSE make_date((EXTRACT(YEAR FROM CURRENT_DATE) - 1)::int, 8, 1)
    END,
    CASE
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 8
            THEN make_date((EXTRACT(YEAR FROM CURRENT_DATE) + 1)::int, 7, 31)
        ELSE make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, 7, 31)
    END,
    'ACTIVE',
    NOW()
FROM institution;
