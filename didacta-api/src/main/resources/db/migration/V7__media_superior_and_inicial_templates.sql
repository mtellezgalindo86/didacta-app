-- =============================================
-- V7: Calendar templates for MEDIA_SUPERIOR and INICIAL
-- =============================================

-- Template: UNAM DGIRE - Preparatoria incorporada a la UNAM 2025-2026
INSERT INTO calendar_templates (id, code, name, description, year_label, period_type, authority, applicable_levels, requires_accreditation, accreditation_authority, start_date, end_date, expected_class_days)
VALUES ('a1000000-0000-0000-0000-000000000005', 'UNAM_DGIRE_2025_2026', 'Calendario UNAM (DGIRE) 2025-2026', 'Calendario para preparatorias incorporadas a la UNAM via DGIRE. Semestral con periodos de examenes ordinarios y extraordinarios.', '2025-2026', 'ANNUAL', 'UNAM', 'MEDIA_SUPERIOR', TRUE, 'UNAM_DGIRE', '2025-08-11', '2026-06-19', 180);

INSERT INTO calendar_template_events (template_id, name, event_type, start_date, end_date, affects_classes, affects_staff, is_mandatory, sort_order) VALUES
('a1000000-0000-0000-0000-000000000005', 'Inicio de clases - Semestre 1', 'ADMIN', '2025-08-11', '2025-08-11', FALSE, FALSE, TRUE, 1),
('a1000000-0000-0000-0000-000000000005', 'Dia de la Independencia', 'HOLIDAY', '2025-09-16', '2025-09-16', TRUE, TRUE, TRUE, 2),
('a1000000-0000-0000-0000-000000000005', 'Dia de Muertos', 'SUSPENSION', '2025-11-03', '2025-11-03', TRUE, FALSE, FALSE, 3),
('a1000000-0000-0000-0000-000000000005', 'Revolucion Mexicana', 'HOLIDAY', '2025-11-17', '2025-11-17', TRUE, TRUE, TRUE, 4),
('a1000000-0000-0000-0000-000000000005', 'Fin de clases - Semestre 1', 'ADMIN', '2025-12-05', '2025-12-05', FALSE, FALSE, TRUE, 5),
('a1000000-0000-0000-0000-000000000005', 'Examenes ordinarios - Semestre 1', 'ADMIN', '2025-12-08', '2025-12-19', TRUE, FALSE, TRUE, 6),
('a1000000-0000-0000-0000-000000000005', 'Vacaciones de invierno', 'VACATION', '2025-12-22', '2026-01-09', TRUE, TRUE, TRUE, 7),
('a1000000-0000-0000-0000-000000000005', 'Navidad', 'HOLIDAY', '2025-12-25', '2025-12-25', TRUE, TRUE, TRUE, 8),
('a1000000-0000-0000-0000-000000000005', 'Ano Nuevo', 'HOLIDAY', '2026-01-01', '2026-01-01', TRUE, TRUE, TRUE, 9),
('a1000000-0000-0000-0000-000000000005', 'Examenes extraordinarios - Semestre 1', 'ADMIN', '2026-01-12', '2026-01-23', TRUE, FALSE, FALSE, 10),
('a1000000-0000-0000-0000-000000000005', 'Inicio de clases - Semestre 2', 'ADMIN', '2026-01-26', '2026-01-26', FALSE, FALSE, TRUE, 11),
('a1000000-0000-0000-0000-000000000005', 'Dia de la Constitucion', 'HOLIDAY', '2026-02-02', '2026-02-02', TRUE, TRUE, TRUE, 12),
('a1000000-0000-0000-0000-000000000005', 'Natalicio de Benito Juarez', 'HOLIDAY', '2026-03-16', '2026-03-16', TRUE, TRUE, TRUE, 13),
('a1000000-0000-0000-0000-000000000005', 'Vacaciones de Semana Santa', 'VACATION', '2026-03-30', '2026-04-10', TRUE, TRUE, TRUE, 14),
('a1000000-0000-0000-0000-000000000005', 'Dia del Trabajo', 'HOLIDAY', '2026-05-01', '2026-05-01', TRUE, TRUE, TRUE, 15),
('a1000000-0000-0000-0000-000000000005', 'Batalla de Puebla', 'HOLIDAY', '2026-05-05', '2026-05-05', TRUE, TRUE, TRUE, 16),
('a1000000-0000-0000-0000-000000000005', 'Dia del Maestro', 'SUSPENSION', '2026-05-15', '2026-05-15', TRUE, TRUE, TRUE, 17),
('a1000000-0000-0000-0000-000000000005', 'Fin de clases - Semestre 2', 'ADMIN', '2026-05-29', '2026-05-29', FALSE, FALSE, TRUE, 18),
('a1000000-0000-0000-0000-000000000005', 'Examenes ordinarios - Semestre 2', 'ADMIN', '2026-06-01', '2026-06-12', TRUE, FALSE, TRUE, 19),
('a1000000-0000-0000-0000-000000000005', 'Examenes extraordinarios - Semestre 2', 'ADMIN', '2026-06-15', '2026-06-19', TRUE, FALSE, FALSE, 20);

-- Template: SEP DGB - Preparatoria incorporada a SEP (Bachillerato General) 2025-2026
INSERT INTO calendar_templates (id, code, name, description, year_label, period_type, authority, applicable_levels, requires_accreditation, accreditation_authority, start_date, end_date, expected_class_days)
VALUES ('a1000000-0000-0000-0000-000000000006', 'SEP_MEDIA_SUPERIOR_2025_2026', 'Calendario SEP Media Superior 2025-2026', 'Calendario para bachilleratos incorporados a la SEP (DGB, DGETI, DGETA). Semestral con jornadas COSDAC.', '2025-2026', 'ANNUAL', 'SEP', 'MEDIA_SUPERIOR', TRUE, 'SEP_RVOE', '2025-08-18', '2026-07-10', 185);

INSERT INTO calendar_template_events (template_id, name, event_type, start_date, end_date, affects_classes, affects_staff, is_mandatory, sort_order) VALUES
('a1000000-0000-0000-0000-000000000006', 'Jornada academica de planeacion', 'CTE', '2025-08-18', '2025-08-22', TRUE, FALSE, TRUE, 1),
('a1000000-0000-0000-0000-000000000006', 'Inicio de clases - Semestre 1', 'ADMIN', '2025-08-25', '2025-08-25', FALSE, FALSE, TRUE, 2),
('a1000000-0000-0000-0000-000000000006', 'Dia de la Independencia', 'HOLIDAY', '2025-09-16', '2025-09-16', TRUE, TRUE, TRUE, 3),
('a1000000-0000-0000-0000-000000000006', 'Revolucion Mexicana', 'HOLIDAY', '2025-11-17', '2025-11-17', TRUE, TRUE, TRUE, 4),
('a1000000-0000-0000-0000-000000000006', 'Evaluaciones parciales - Semestre 1', 'ADMIN', '2025-11-24', '2025-11-28', FALSE, FALSE, TRUE, 5),
('a1000000-0000-0000-0000-000000000006', 'Examenes semestrales - Semestre 1', 'ADMIN', '2025-12-08', '2025-12-12', TRUE, FALSE, TRUE, 6),
('a1000000-0000-0000-0000-000000000006', 'Vacaciones de invierno', 'VACATION', '2025-12-22', '2026-01-09', TRUE, TRUE, TRUE, 7),
('a1000000-0000-0000-0000-000000000006', 'Navidad', 'HOLIDAY', '2025-12-25', '2025-12-25', TRUE, TRUE, TRUE, 8),
('a1000000-0000-0000-0000-000000000006', 'Ano Nuevo', 'HOLIDAY', '2026-01-01', '2026-01-01', TRUE, TRUE, TRUE, 9),
('a1000000-0000-0000-0000-000000000006', 'Inicio de clases - Semestre 2', 'ADMIN', '2026-01-12', '2026-01-12', FALSE, FALSE, TRUE, 10),
('a1000000-0000-0000-0000-000000000006', 'Dia de la Constitucion', 'HOLIDAY', '2026-02-02', '2026-02-02', TRUE, TRUE, TRUE, 11),
('a1000000-0000-0000-0000-000000000006', 'Natalicio de Benito Juarez', 'HOLIDAY', '2026-03-16', '2026-03-16', TRUE, TRUE, TRUE, 12),
('a1000000-0000-0000-0000-000000000006', 'Vacaciones de Semana Santa', 'VACATION', '2026-03-30', '2026-04-10', TRUE, TRUE, TRUE, 13),
('a1000000-0000-0000-0000-000000000006', 'Dia del Trabajo', 'HOLIDAY', '2026-05-01', '2026-05-01', TRUE, TRUE, TRUE, 14),
('a1000000-0000-0000-0000-000000000006', 'Batalla de Puebla', 'HOLIDAY', '2026-05-05', '2026-05-05', TRUE, TRUE, TRUE, 15),
('a1000000-0000-0000-0000-000000000006', 'Dia del Maestro', 'SUSPENSION', '2026-05-15', '2026-05-15', TRUE, TRUE, TRUE, 16),
('a1000000-0000-0000-0000-000000000006', 'Evaluaciones parciales - Semestre 2', 'ADMIN', '2026-05-25', '2026-05-29', FALSE, FALSE, TRUE, 17),
('a1000000-0000-0000-0000-000000000006', 'Examenes semestrales - Semestre 2', 'ADMIN', '2026-06-15', '2026-06-19', TRUE, FALSE, TRUE, 18),
('a1000000-0000-0000-0000-000000000006', 'Fin de cursos', 'ADMIN', '2026-07-03', '2026-07-03', FALSE, FALSE, TRUE, 19),
('a1000000-0000-0000-0000-000000000006', 'Vacaciones de verano', 'VACATION', '2026-07-11', '2026-08-17', TRUE, TRUE, FALSE, 20);

-- Template: IPN - Preparatoria incorporada al IPN 2025-2026
INSERT INTO calendar_templates (id, code, name, description, year_label, period_type, authority, applicable_levels, requires_accreditation, accreditation_authority, start_date, end_date, expected_class_days)
VALUES ('a1000000-0000-0000-0000-000000000007', 'IPN_MEDIA_SUPERIOR_2025_2026', 'Calendario IPN Media Superior 2025-2026', 'Calendario para escuelas incorporadas al IPN (CECyT y similares). Semestral.', '2025-2026', 'ANNUAL', 'IPN', 'MEDIA_SUPERIOR', TRUE, 'IPN', '2025-08-11', '2026-06-26', 180);

INSERT INTO calendar_template_events (template_id, name, event_type, start_date, end_date, affects_classes, affects_staff, is_mandatory, sort_order) VALUES
('a1000000-0000-0000-0000-000000000007', 'Inicio de clases - Semestre 1', 'ADMIN', '2025-08-11', '2025-08-11', FALSE, FALSE, TRUE, 1),
('a1000000-0000-0000-0000-000000000007', 'Dia de la Independencia', 'HOLIDAY', '2025-09-16', '2025-09-16', TRUE, TRUE, TRUE, 2),
('a1000000-0000-0000-0000-000000000007', 'Primer examen departamental', 'ADMIN', '2025-10-06', '2025-10-10', TRUE, FALSE, TRUE, 3),
('a1000000-0000-0000-0000-000000000007', 'Dia de Muertos', 'SUSPENSION', '2025-11-03', '2025-11-03', TRUE, FALSE, FALSE, 4),
('a1000000-0000-0000-0000-000000000007', 'Segundo examen departamental', 'ADMIN', '2025-11-10', '2025-11-14', TRUE, FALSE, TRUE, 5),
('a1000000-0000-0000-0000-000000000007', 'Revolucion Mexicana', 'HOLIDAY', '2025-11-17', '2025-11-17', TRUE, TRUE, TRUE, 6),
('a1000000-0000-0000-0000-000000000007', 'Tercer examen departamental', 'ADMIN', '2025-12-01', '2025-12-05', TRUE, FALSE, TRUE, 7),
('a1000000-0000-0000-0000-000000000007', 'Vacaciones de invierno', 'VACATION', '2025-12-22', '2026-01-09', TRUE, TRUE, TRUE, 8),
('a1000000-0000-0000-0000-000000000007', 'Navidad', 'HOLIDAY', '2025-12-25', '2025-12-25', TRUE, TRUE, TRUE, 9),
('a1000000-0000-0000-0000-000000000007', 'Ano Nuevo', 'HOLIDAY', '2026-01-01', '2026-01-01', TRUE, TRUE, TRUE, 10),
('a1000000-0000-0000-0000-000000000007', 'Periodo ETS - Semestre 1', 'ADMIN', '2026-01-12', '2026-01-23', TRUE, FALSE, FALSE, 11),
('a1000000-0000-0000-0000-000000000007', 'Inicio de clases - Semestre 2', 'ADMIN', '2026-01-26', '2026-01-26', FALSE, FALSE, TRUE, 12),
('a1000000-0000-0000-0000-000000000007', 'Dia de la Constitucion', 'HOLIDAY', '2026-02-02', '2026-02-02', TRUE, TRUE, TRUE, 13),
('a1000000-0000-0000-0000-000000000007', 'Natalicio de Benito Juarez', 'HOLIDAY', '2026-03-16', '2026-03-16', TRUE, TRUE, TRUE, 14),
('a1000000-0000-0000-0000-000000000007', 'Vacaciones de Semana Santa', 'VACATION', '2026-03-30', '2026-04-10', TRUE, TRUE, TRUE, 15),
('a1000000-0000-0000-0000-000000000007', 'Cuarto examen departamental', 'ADMIN', '2026-04-13', '2026-04-17', TRUE, FALSE, TRUE, 16),
('a1000000-0000-0000-0000-000000000007', 'Dia del Trabajo', 'HOLIDAY', '2026-05-01', '2026-05-01', TRUE, TRUE, TRUE, 17),
('a1000000-0000-0000-0000-000000000007', 'Batalla de Puebla', 'HOLIDAY', '2026-05-05', '2026-05-05', TRUE, TRUE, TRUE, 18),
('a1000000-0000-0000-0000-000000000007', 'Quinto examen departamental', 'ADMIN', '2026-05-11', '2026-05-15', TRUE, FALSE, TRUE, 19),
('a1000000-0000-0000-0000-000000000007', 'Dia del Maestro', 'SUSPENSION', '2026-05-15', '2026-05-15', TRUE, TRUE, TRUE, 20),
('a1000000-0000-0000-0000-000000000007', 'Sexto examen departamental', 'ADMIN', '2026-06-08', '2026-06-12', TRUE, FALSE, TRUE, 21),
('a1000000-0000-0000-0000-000000000007', 'Periodo ETS - Semestre 2', 'ADMIN', '2026-06-22', '2026-06-26', TRUE, FALSE, FALSE, 22);

-- Template: Preparatoria/Bachillerato Privado sin incorporacion 2025-2026
INSERT INTO calendar_templates (id, code, name, description, year_label, period_type, authority, applicable_levels, requires_accreditation, accreditation_authority, start_date, end_date, expected_class_days)
VALUES ('a1000000-0000-0000-0000-000000000008', 'MEDIA_SUPERIOR_PRIVADO_2025_2026', 'Calendario Media Superior Privado 2025-2026', 'Calendario flexible para bachilleratos privados sin incorporacion. Solo dias festivos oficiales.', '2025-2026', 'ANNUAL', 'NONE', 'MEDIA_SUPERIOR', FALSE, NULL, '2025-08-18', '2026-07-10', 190);

INSERT INTO calendar_template_events (template_id, name, event_type, start_date, end_date, affects_classes, affects_staff, is_mandatory, sort_order) VALUES
('a1000000-0000-0000-0000-000000000008', 'Dia de la Independencia', 'HOLIDAY', '2025-09-16', '2025-09-16', TRUE, TRUE, TRUE, 1),
('a1000000-0000-0000-0000-000000000008', 'Dia de Muertos', 'SUSPENSION', '2025-11-03', '2025-11-03', TRUE, FALSE, FALSE, 2),
('a1000000-0000-0000-0000-000000000008', 'Revolucion Mexicana', 'HOLIDAY', '2025-11-17', '2025-11-17', TRUE, TRUE, TRUE, 3),
('a1000000-0000-0000-0000-000000000008', 'Vacaciones de invierno', 'VACATION', '2025-12-22', '2026-01-09', TRUE, TRUE, FALSE, 4),
('a1000000-0000-0000-0000-000000000008', 'Navidad', 'HOLIDAY', '2025-12-25', '2025-12-25', TRUE, TRUE, TRUE, 5),
('a1000000-0000-0000-0000-000000000008', 'Ano Nuevo', 'HOLIDAY', '2026-01-01', '2026-01-01', TRUE, TRUE, TRUE, 6),
('a1000000-0000-0000-0000-000000000008', 'Dia de la Constitucion', 'HOLIDAY', '2026-02-02', '2026-02-02', TRUE, TRUE, TRUE, 7),
('a1000000-0000-0000-0000-000000000008', 'Natalicio de Benito Juarez', 'HOLIDAY', '2026-03-16', '2026-03-16', TRUE, TRUE, TRUE, 8),
('a1000000-0000-0000-0000-000000000008', 'Vacaciones de Semana Santa', 'VACATION', '2026-03-30', '2026-04-10', TRUE, TRUE, FALSE, 9),
('a1000000-0000-0000-0000-000000000008', 'Dia del Trabajo', 'HOLIDAY', '2026-05-01', '2026-05-01', TRUE, TRUE, TRUE, 10),
('a1000000-0000-0000-0000-000000000008', 'Batalla de Puebla', 'HOLIDAY', '2026-05-05', '2026-05-05', TRUE, TRUE, TRUE, 11),
('a1000000-0000-0000-0000-000000000008', 'Dia del Maestro', 'SUSPENSION', '2026-05-15', '2026-05-15', TRUE, TRUE, TRUE, 12);

-- Template: Inicial (guarderia educativa / CENDI) 2025-2026
INSERT INTO calendar_templates (id, code, name, description, year_label, period_type, authority, applicable_levels, requires_accreditation, accreditation_authority, start_date, end_date, expected_class_days)
VALUES ('a1000000-0000-0000-0000-000000000009', 'INICIAL_2025_2026', 'Calendario Educacion Inicial 2025-2026', 'Calendario para centros de educacion inicial (CENDI, guarderias educativas). Operacion continua con dias festivos oficiales.', '2025-2026', 'ANNUAL', 'NONE', 'INICIAL', FALSE, NULL, '2025-08-18', '2026-08-14', 240);

INSERT INTO calendar_template_events (template_id, name, event_type, start_date, end_date, affects_classes, affects_staff, is_mandatory, sort_order) VALUES
('a1000000-0000-0000-0000-000000000009', 'Dia de la Independencia', 'HOLIDAY', '2025-09-16', '2025-09-16', TRUE, TRUE, TRUE, 1),
('a1000000-0000-0000-0000-000000000009', 'Dia de Muertos', 'SUSPENSION', '2025-11-03', '2025-11-03', TRUE, FALSE, FALSE, 2),
('a1000000-0000-0000-0000-000000000009', 'Revolucion Mexicana', 'HOLIDAY', '2025-11-17', '2025-11-17', TRUE, TRUE, TRUE, 3),
('a1000000-0000-0000-0000-000000000009', 'Dia de la Virgen de Guadalupe', 'SUSPENSION', '2025-12-12', '2025-12-12', TRUE, FALSE, FALSE, 4),
('a1000000-0000-0000-0000-000000000009', 'Vacaciones de invierno', 'VACATION', '2025-12-22', '2026-01-06', TRUE, TRUE, FALSE, 5),
('a1000000-0000-0000-0000-000000000009', 'Navidad', 'HOLIDAY', '2025-12-25', '2025-12-25', TRUE, TRUE, TRUE, 6),
('a1000000-0000-0000-0000-000000000009', 'Ano Nuevo', 'HOLIDAY', '2026-01-01', '2026-01-01', TRUE, TRUE, TRUE, 7),
('a1000000-0000-0000-0000-000000000009', 'Dia de la Constitucion', 'HOLIDAY', '2026-02-02', '2026-02-02', TRUE, TRUE, TRUE, 8),
('a1000000-0000-0000-0000-000000000009', 'Natalicio de Benito Juarez', 'HOLIDAY', '2026-03-16', '2026-03-16', TRUE, TRUE, TRUE, 9),
('a1000000-0000-0000-0000-000000000009', 'Semana Santa', 'VACATION', '2026-04-02', '2026-04-03', TRUE, TRUE, FALSE, 10),
('a1000000-0000-0000-0000-000000000009', 'Dia del Nino', 'SUSPENSION', '2026-04-30', '2026-04-30', TRUE, FALSE, FALSE, 11),
('a1000000-0000-0000-0000-000000000009', 'Dia del Trabajo', 'HOLIDAY', '2026-05-01', '2026-05-01', TRUE, TRUE, TRUE, 12);
