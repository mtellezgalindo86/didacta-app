-- =============================================
-- V6: Academic Sections and Calendar System
-- =============================================

-- 1. Academic Sections (nivel educativo con incorporacion)
CREATE TABLE academic_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institution(id),
    level VARCHAR(30) NOT NULL,
    accreditation_type VARCHAR(30) NOT NULL DEFAULT 'NONE',
    accreditation_key VARCHAR(100),
    name VARCHAR(100),
    display_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(255)
);
CREATE INDEX idx_academic_section_tenant ON academic_sections(tenant_id);
CREATE UNIQUE INDEX idx_academic_section_inst_level ON academic_sections(institution_id, level);

-- 2. Add section_id to groups (nullable for backward compat)
ALTER TABLE group_entity ADD COLUMN section_id UUID REFERENCES academic_sections(id);

-- 3. Calendar templates (global, NOT tenant-scoped)
CREATE TABLE calendar_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    year_label VARCHAR(20) NOT NULL,
    period_type VARCHAR(20) NOT NULL DEFAULT 'ANNUAL',
    authority VARCHAR(30) NOT NULL DEFAULT 'NONE',
    applicable_levels TEXT,
    requires_accreditation BOOLEAN NOT NULL DEFAULT FALSE,
    accreditation_authority VARCHAR(30),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    expected_class_days INT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Calendar template events
CREATE TABLE calendar_template_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES calendar_templates(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    affects_classes BOOLEAN NOT NULL DEFAULT TRUE,
    affects_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_template_event_template ON calendar_template_events(template_id);

-- 5. Institution calendars (tenant-scoped, editable copy)
CREATE TABLE institution_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institution(id),
    section_id UUID REFERENCES academic_sections(id),
    school_year_id UUID NOT NULL REFERENCES school_year(id),
    source_template_id UUID REFERENCES calendar_templates(id),
    name VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(255),
    CONSTRAINT uq_inst_cal_section_year UNIQUE (institution_id, section_id, school_year_id)
);
CREATE INDEX idx_inst_calendar_tenant ON institution_calendars(tenant_id);

-- 6. Calendar events (tenant-scoped, editable)
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id UUID NOT NULL REFERENCES institution_calendars(id) ON DELETE CASCADE,
    source_template_event_id UUID REFERENCES calendar_template_events(id),
    name VARCHAR(200) NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    affects_classes BOOLEAN NOT NULL DEFAULT TRUE,
    affects_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_from_template BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by VARCHAR(255)
);
CREATE INDEX idx_cal_event_calendar ON calendar_events(calendar_id);
CREATE INDEX idx_cal_event_tenant ON calendar_events(tenant_id);
CREATE INDEX idx_cal_event_dates ON calendar_events(start_date, end_date);

-- 7. Add has_sep_incorporation to institution
ALTER TABLE institution ADD COLUMN IF NOT EXISTS has_sep_incorporation BOOLEAN DEFAULT FALSE;

-- 8. Migrate existing data: create academic sections for existing institutions
INSERT INTO academic_sections (institution_id, level, accreditation_type, name, display_order, tenant_id, created_at)
SELECT i.id, i.main_level, 'NONE', NULL, 0, i.id::text, NOW()
FROM institution i
WHERE i.main_level IS NOT NULL
ON CONFLICT (institution_id, level) DO NOTHING;

-- =============================================
-- 9. Seed calendar templates
-- =============================================

-- Template: SEP Educacion Basica 2025-2026
INSERT INTO calendar_templates (id, code, name, description, year_label, period_type, authority, applicable_levels, requires_accreditation, accreditation_authority, start_date, end_date, expected_class_days)
VALUES ('a1000000-0000-0000-0000-000000000001', 'SEP_BASICA_2025_2026', 'Calendario SEP Educacion Basica 2025-2026', 'Calendario oficial de la SEP para educacion basica. 185 dias efectivos.', '2025-2026', 'ANNUAL', 'SEP', 'PREESCOLAR,PRIMARIA,SECUNDARIA', TRUE, 'SEP_RVOE', '2025-09-01', '2026-07-15', 185);

INSERT INTO calendar_template_events (template_id, name, event_type, start_date, end_date, affects_classes, affects_staff, is_mandatory, sort_order) VALUES
('a1000000-0000-0000-0000-000000000001', 'Fase Intensiva CTE', 'CTE', '2025-08-25', '2025-08-29', TRUE, FALSE, TRUE, 1),
('a1000000-0000-0000-0000-000000000001', 'Dia de la Independencia', 'HOLIDAY', '2025-09-16', '2025-09-16', TRUE, TRUE, TRUE, 10),
('a1000000-0000-0000-0000-000000000001', 'CTE - 1a sesion ordinaria', 'CTE', '2025-09-26', '2025-09-26', TRUE, FALSE, TRUE, 11),
('a1000000-0000-0000-0000-000000000001', 'CTE - 2a sesion ordinaria', 'CTE', '2025-10-31', '2025-10-31', TRUE, FALSE, TRUE, 12),
('a1000000-0000-0000-0000-000000000001', 'Registro calificaciones - Primer periodo', 'ADMIN', '2025-11-14', '2025-11-14', FALSE, FALSE, TRUE, 13),
('a1000000-0000-0000-0000-000000000001', 'Revolucion Mexicana', 'HOLIDAY', '2025-11-17', '2025-11-17', TRUE, TRUE, TRUE, 14),
('a1000000-0000-0000-0000-000000000001', 'CTE - 3a sesion ordinaria', 'CTE', '2025-11-28', '2025-11-28', TRUE, FALSE, TRUE, 15),
('a1000000-0000-0000-0000-000000000001', 'Vacaciones de invierno', 'VACATION', '2025-12-22', '2026-01-09', TRUE, TRUE, TRUE, 16),
('a1000000-0000-0000-0000-000000000001', 'Navidad', 'HOLIDAY', '2025-12-25', '2025-12-25', TRUE, TRUE, TRUE, 17),
('a1000000-0000-0000-0000-000000000001', 'Ano Nuevo', 'HOLIDAY', '2026-01-01', '2026-01-01', TRUE, TRUE, TRUE, 18),
('a1000000-0000-0000-0000-000000000001', 'Taller intensivo - Direccion', 'CTE', '2026-01-07', '2026-01-07', TRUE, FALSE, TRUE, 19),
('a1000000-0000-0000-0000-000000000001', 'Taller intensivo - Docentes', 'CTE', '2026-01-08', '2026-01-09', TRUE, FALSE, TRUE, 20),
('a1000000-0000-0000-0000-000000000001', 'CTE - 4a sesion ordinaria', 'CTE', '2026-01-30', '2026-01-30', TRUE, FALSE, TRUE, 21),
('a1000000-0000-0000-0000-000000000001', 'Dia de la Constitucion', 'HOLIDAY', '2026-02-03', '2026-02-03', TRUE, TRUE, TRUE, 22),
('a1000000-0000-0000-0000-000000000001', 'Preinscripciones 2026-2027', 'ADMIN', '2026-02-03', '2026-02-13', FALSE, FALSE, FALSE, 23),
('a1000000-0000-0000-0000-000000000001', 'CTE - 5a sesion ordinaria', 'CTE', '2026-02-27', '2026-02-27', TRUE, FALSE, TRUE, 24),
('a1000000-0000-0000-0000-000000000001', 'Registro calificaciones - Segundo periodo', 'ADMIN', '2026-03-13', '2026-03-13', FALSE, FALSE, TRUE, 25),
('a1000000-0000-0000-0000-000000000001', 'Natalicio de Benito Juarez', 'HOLIDAY', '2026-03-16', '2026-03-16', TRUE, TRUE, TRUE, 26),
('a1000000-0000-0000-0000-000000000001', 'CTE - 6a sesion ordinaria', 'CTE', '2026-03-27', '2026-03-27', TRUE, FALSE, TRUE, 27),
('a1000000-0000-0000-0000-000000000001', 'Vacaciones de Semana Santa', 'VACATION', '2026-03-30', '2026-04-10', TRUE, TRUE, TRUE, 28),
('a1000000-0000-0000-0000-000000000001', 'Dia del Trabajo', 'HOLIDAY', '2026-05-01', '2026-05-01', TRUE, TRUE, TRUE, 29),
('a1000000-0000-0000-0000-000000000001', 'Batalla de Puebla', 'HOLIDAY', '2026-05-05', '2026-05-05', TRUE, TRUE, TRUE, 30),
('a1000000-0000-0000-0000-000000000001', 'Dia del Maestro', 'SUSPENSION', '2026-05-15', '2026-05-15', TRUE, TRUE, TRUE, 31),
('a1000000-0000-0000-0000-000000000001', 'CTE - 7a sesion ordinaria', 'CTE', '2026-05-29', '2026-05-29', TRUE, FALSE, TRUE, 32),
('a1000000-0000-0000-0000-000000000001', 'CTE - 8a sesion ordinaria', 'CTE', '2026-06-26', '2026-06-26', TRUE, FALSE, TRUE, 33),
('a1000000-0000-0000-0000-000000000001', 'Registro calificaciones - Tercer periodo', 'ADMIN', '2026-07-03', '2026-07-03', FALSE, FALSE, TRUE, 34),
('a1000000-0000-0000-0000-000000000001', 'Vacaciones de verano', 'VACATION', '2026-07-16', '2026-08-31', TRUE, TRUE, FALSE, 35);

-- Template: Guarderia Privada 2025-2026
INSERT INTO calendar_templates (id, code, name, description, year_label, period_type, authority, applicable_levels, requires_accreditation, accreditation_authority, start_date, end_date, expected_class_days)
VALUES ('a1000000-0000-0000-0000-000000000002', 'GUARDERIA_PRIVADA_2025_2026', 'Calendario Guarderia Privada 2025-2026', 'Calendario para guarderias y maternales privados sin incorporacion SEP.', '2025-2026', 'ANNUAL', 'NONE', 'MATERNAL', FALSE, NULL, '2025-08-18', '2026-08-14', 240);

INSERT INTO calendar_template_events (template_id, name, event_type, start_date, end_date, affects_classes, affects_staff, is_mandatory, sort_order) VALUES
('a1000000-0000-0000-0000-000000000002', 'Dia de la Independencia', 'HOLIDAY', '2025-09-16', '2025-09-16', TRUE, TRUE, TRUE, 10),
('a1000000-0000-0000-0000-000000000002', 'Dia de Muertos', 'SUSPENSION', '2025-11-03', '2025-11-03', TRUE, FALSE, FALSE, 11),
('a1000000-0000-0000-0000-000000000002', 'Revolucion Mexicana', 'HOLIDAY', '2025-11-17', '2025-11-17', TRUE, TRUE, TRUE, 12),
('a1000000-0000-0000-0000-000000000002', 'Dia de la Virgen de Guadalupe', 'SUSPENSION', '2025-12-12', '2025-12-12', TRUE, FALSE, FALSE, 13),
('a1000000-0000-0000-0000-000000000002', 'Vacaciones de invierno', 'VACATION', '2025-12-22', '2026-01-06', TRUE, TRUE, FALSE, 14),
('a1000000-0000-0000-0000-000000000002', 'Navidad', 'HOLIDAY', '2025-12-25', '2025-12-25', TRUE, TRUE, TRUE, 15),
('a1000000-0000-0000-0000-000000000002', 'Ano Nuevo', 'HOLIDAY', '2026-01-01', '2026-01-01', TRUE, TRUE, TRUE, 16),
('a1000000-0000-0000-0000-000000000002', 'Dia de la Constitucion', 'HOLIDAY', '2026-02-02', '2026-02-02', TRUE, TRUE, TRUE, 17),
('a1000000-0000-0000-0000-000000000002', 'Natalicio de Benito Juarez', 'HOLIDAY', '2026-03-16', '2026-03-16', TRUE, TRUE, TRUE, 18),
('a1000000-0000-0000-0000-000000000002', 'Semana Santa', 'VACATION', '2026-04-02', '2026-04-03', TRUE, TRUE, FALSE, 19),
('a1000000-0000-0000-0000-000000000002', 'Dia del Nino', 'SUSPENSION', '2026-04-30', '2026-04-30', TRUE, FALSE, FALSE, 20),
('a1000000-0000-0000-0000-000000000002', 'Dia del Trabajo', 'HOLIDAY', '2026-05-01', '2026-05-01', TRUE, TRUE, TRUE, 21);

-- Template: Preescolar Privado Flexible 2025-2026
INSERT INTO calendar_templates (id, code, name, description, year_label, period_type, authority, applicable_levels, requires_accreditation, accreditation_authority, start_date, end_date, expected_class_days)
VALUES ('a1000000-0000-0000-0000-000000000003', 'PREESCOLAR_PRIVADO_2025_2026', 'Calendario Preescolar Privado 2025-2026', 'Calendario para preescolares privados sin incorporacion SEP. Estructura similar a SEP pero flexible.', '2025-2026', 'ANNUAL', 'NONE', 'PREESCOLAR', FALSE, NULL, '2025-08-25', '2026-07-15', 190);

INSERT INTO calendar_template_events (template_id, name, event_type, start_date, end_date, affects_classes, affects_staff, is_mandatory, sort_order) VALUES
('a1000000-0000-0000-0000-000000000003', 'Dia de la Independencia', 'HOLIDAY', '2025-09-16', '2025-09-16', TRUE, TRUE, TRUE, 10),
('a1000000-0000-0000-0000-000000000003', 'Dia de Muertos', 'SUSPENSION', '2025-11-03', '2025-11-03', TRUE, FALSE, FALSE, 11),
('a1000000-0000-0000-0000-000000000003', 'Revolucion Mexicana', 'HOLIDAY', '2025-11-17', '2025-11-17', TRUE, TRUE, TRUE, 12),
('a1000000-0000-0000-0000-000000000003', 'Vacaciones de invierno', 'VACATION', '2025-12-22', '2026-01-09', TRUE, TRUE, FALSE, 13),
('a1000000-0000-0000-0000-000000000003', 'Navidad', 'HOLIDAY', '2025-12-25', '2025-12-25', TRUE, TRUE, TRUE, 14),
('a1000000-0000-0000-0000-000000000003', 'Ano Nuevo', 'HOLIDAY', '2026-01-01', '2026-01-01', TRUE, TRUE, TRUE, 15),
('a1000000-0000-0000-0000-000000000003', 'Dia de la Constitucion', 'HOLIDAY', '2026-02-02', '2026-02-02', TRUE, TRUE, TRUE, 16),
('a1000000-0000-0000-0000-000000000003', 'Natalicio de Benito Juarez', 'HOLIDAY', '2026-03-16', '2026-03-16', TRUE, TRUE, TRUE, 17),
('a1000000-0000-0000-0000-000000000003', 'Vacaciones de Semana Santa', 'VACATION', '2026-03-30', '2026-04-10', TRUE, TRUE, FALSE, 18),
('a1000000-0000-0000-0000-000000000003', 'Dia del Nino', 'SUSPENSION', '2026-04-30', '2026-04-30', TRUE, FALSE, FALSE, 19),
('a1000000-0000-0000-0000-000000000003', 'Dia del Trabajo', 'HOLIDAY', '2026-05-01', '2026-05-01', TRUE, TRUE, TRUE, 20),
('a1000000-0000-0000-0000-000000000003', 'Batalla de Puebla', 'SUSPENSION', '2026-05-05', '2026-05-05', TRUE, FALSE, FALSE, 21),
('a1000000-0000-0000-0000-000000000003', 'Dia del Maestro', 'SUSPENSION', '2026-05-15', '2026-05-15', TRUE, FALSE, FALSE, 22);

-- Template: Empresarial 2026
INSERT INTO calendar_templates (id, code, name, description, year_label, period_type, authority, applicable_levels, requires_accreditation, accreditation_authority, start_date, end_date, expected_class_days)
VALUES ('a1000000-0000-0000-0000-000000000004', 'EMPRESARIAL_2026', 'Calendario Laboral Mexico 2026', 'Calendario laboral estandar. Solo dias festivos de ley. Totalmente configurable.', '2026', 'ANNUAL', 'NONE', 'EMPRESARIAL', FALSE, NULL, '2026-01-01', '2026-12-31', 250);

INSERT INTO calendar_template_events (template_id, name, event_type, start_date, end_date, affects_classes, affects_staff, is_mandatory, sort_order) VALUES
('a1000000-0000-0000-0000-000000000004', 'Ano Nuevo', 'HOLIDAY', '2026-01-01', '2026-01-01', TRUE, TRUE, TRUE, 1),
('a1000000-0000-0000-0000-000000000004', 'Dia de la Constitucion', 'HOLIDAY', '2026-02-02', '2026-02-02', TRUE, TRUE, TRUE, 2),
('a1000000-0000-0000-0000-000000000004', 'Natalicio de Benito Juarez', 'HOLIDAY', '2026-03-16', '2026-03-16', TRUE, TRUE, TRUE, 3),
('a1000000-0000-0000-0000-000000000004', 'Dia del Trabajo', 'HOLIDAY', '2026-05-01', '2026-05-01', TRUE, TRUE, TRUE, 4),
('a1000000-0000-0000-0000-000000000004', 'Dia de la Independencia', 'HOLIDAY', '2026-09-16', '2026-09-16', TRUE, TRUE, TRUE, 5),
('a1000000-0000-0000-0000-000000000004', 'Revolucion Mexicana', 'HOLIDAY', '2026-11-16', '2026-11-16', TRUE, TRUE, TRUE, 6),
('a1000000-0000-0000-0000-000000000004', 'Navidad', 'HOLIDAY', '2026-12-25', '2026-12-25', TRUE, TRUE, TRUE, 7);
