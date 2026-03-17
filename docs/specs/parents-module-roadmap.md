# Módulo Padres/Alumnos - Roadmap Completo

## Principio Core
TODO el contacto padres-escuela es dentro de la plataforma. No WhatsApp. Todo medible y auditable. La operación diaria genera evidencia automáticamente.

---

## Fase 1: Guardian + Vinculación (3 semanas)

**Objetivo:** Establecer la entidad Guardian como ciudadano de primera clase, migrar datos planos de Student, y permitir al staff vincular tutores a alumnos con permisos granulares.

**Dependencias:** Ninguna (es la base de todo)

### User Stories

**PAR-001: Crear tutor desde perfil del alumno** (MUST, M)
- Como coordinadora, quiero registrar los datos de un tutor y vincularlo a un alumno, para tener un directorio de contacto completo.
- Criterios:
  - [ ] Formulario con nombre, apellido, teléfono (obligatorio), email (opcional)
  - [ ] Seleccionar parentesco: Madre, Padre, Abuelo/a, Tío/a, Tutor legal, Otro
  - [ ] Configurar permisos: contacto primario, autorizado para recoger, recibe notificaciones
  - [ ] Si el teléfono ya existe en el tenant, ofrecer vincular al tutor existente (deduplicación)

**PAR-002: Vincular tutor existente a otro alumno** (MUST, S)
- Como coordinadora, quiero vincular un tutor ya registrado a otro alumno (hermanos), para no duplicar datos.
- Criterios:
  - [ ] Búsqueda por teléfono o nombre en el modal
  - [ ] Si encuentra match, mostrar datos y botón "Vincular"
  - [ ] Solo pedir parentesco y permisos, no volver a capturar datos personales

**PAR-003: Ver tutores de un alumno** (MUST, S)
- Como maestra, quiero ver los tutores vinculados a un alumno con sus permisos, para saber a quién contactar y quién puede recogerlo.
- Criterios:
  - [ ] Sección "Tutores vinculados" en perfil del alumno
  - [ ] Mostrar nombre, teléfono, email, parentesco (badge color), permisos (badges)
  - [ ] Empty state si no tiene tutores

**PAR-004: Desvincular tutor de un alumno** (MUST, S)
- Como coordinadora, quiero desvincular un tutor de un alumno, para corregir errores o cambios de custodia.
- Criterios:
  - [ ] Confirmación antes de desvincular
  - [ ] El tutor NO se elimina del sistema, solo se quita la relación
  - [ ] Si era contacto primario, mostrar warning

**PAR-005: Directorio de tutores** (MUST, M)
- Como directora, quiero ver un directorio de todos los tutores de la institución con sus hijos vinculados.
- Criterios:
  - [ ] Lista filtrable por búsqueda (nombre/teléfono), grupo del hijo
  - [ ] Cada tutor muestra: nombre, teléfono, hijos vinculados como badges
  - [ ] Click navega al perfil del tutor

**PAR-006: Perfil del tutor** (MUST, M)
- Como coordinadora, quiero ver el perfil completo de un tutor con todos sus hijos vinculados.
- Criterios:
  - [ ] Datos de contacto (teléfono, email)
  - [ ] Lista de hijos con grupo, parentesco y permisos
  - [ ] Botón editar datos del tutor
  - [ ] Botón vincular otro hijo

**PAR-007: Editar datos del tutor** (MUST, S)
- Como coordinadora, quiero editar los datos de un tutor (nombre, teléfono, email).
- Criterios:
  - [ ] Si cambia el teléfono, validar que no exista otro tutor con ese número
  - [ ] Modal de edición pre-llenado

**PAR-008: Migración automática de datos legacy** (MUST, L)
- Como sistema, al aplicar la migración V9, los datos de guardian_name/phone/email en Student se convierten automáticamente en entidades Guardian + StudentGuardian.
- Criterios:
  - [ ] Deduplicación por teléfono (hermanos con mismo tutor = un solo Guardian)
  - [ ] Relación por defecto: TUTOR, isPrimary=true, canPickUp=true
  - [ ] Campos legacy en Student se mantienen (no se borran)

### Entidades: guardian, student_guardian
### Endpoints: 9 bajo /api/guardians
### Vistas: StudentListView, StudentProfileView, GuardianListView, GuardianProfileView, modales

---

## Fase 2: Onboarding del Padre (3 semanas)

**Objetivo:** El padre puede crear cuenta, entrar al sistema y ver información de su hijo.

**Dependencias:** Fase 1 completa

### User Stories

**PAR-009: Invitar tutor al sistema** (MUST, M)
- Como coordinadora, quiero enviar una invitación por email a un tutor para que cree su cuenta.
- Criterios:
  - [ ] Botón "Invitar al sistema" en perfil del tutor
  - [ ] Genera invitation_token con expiración de 30 días
  - [ ] Envía email con link: /invite/{token}
  - [ ] Estado de invitación visible: PENDING, SENT, ACCEPTED, EXPIRED

**PAR-010: Aceptar invitación** (MUST, L)
- Como padre, quiero aceptar la invitación y crear mi cuenta para acceder a la plataforma.
- Criterios:
  - [ ] Página pública /invite/{token} muestra: nombre de escuela, nombre del hijo
  - [ ] Formulario de registro (o login si ya tiene cuenta Keycloak)
  - [ ] Al registrarse: crea AppUser, InstitutionUser con rol GUARDIAN, vincula Guardian.appUserId
  - [ ] Redirige al dashboard del padre

**PAR-011: Dashboard del padre (solo lectura)** (MUST, L)
- Como padre, quiero ver un resumen del día de mi hijo al entrar a la app.
- Criterios:
  - [ ] Layout diferente al del staff (mobile-first, sin sidebar pesado)
  - [ ] Selector de hijo si tiene varios
  - [ ] Estado de asistencia del día
  - [ ] Próximos eventos del calendario
  - [ ] Mensaje: "Aún no hay reportes del día"

**PAR-012: AuthGuard para rol GUARDIAN** (MUST, M)
- Como sistema, al detectar que el usuario tiene rol GUARDIAN, redirigir a /family en vez de /dashboard.
- Criterios:
  - [ ] AuthGuard detecta rol del InstitutionUser
  - [ ] GUARDIAN → /family (layout padre)
  - [ ] Otros roles → /dashboard (layout staff)
  - [ ] GUARDIAN no puede acceder a rutas de staff

**PAR-013: Historial de asistencia del padre** (SHOULD, M)
- Como padre, quiero ver el historial de asistencia de mi hijo (calendario mensual).
- Criterios:
  - [ ] Vista mensual tipo grid con iconos presente/ausente/retardo
  - [ ] Estadísticas: % asistencia, días ausentes

**PAR-014: Perfil del hijo (vista padre)** (SHOULD, M)
- Como padre, quiero ver y editar datos médicos/alergias de mi hijo.
- Criterios:
  - [ ] Datos básicos (solo lectura): nombre, grupo, maestra
  - [ ] Datos médicos (editables por padre): alergias, restricciones, contacto médico

**PAR-015: Re-enviar invitación** (SHOULD, S)
- Como coordinadora, quiero re-enviar una invitación que no fue aceptada.
- Criterios:
  - [ ] Regenera token si expiró
  - [ ] Actualiza invitation_sent_at

### Entidades: Campos de invitación en guardian, InstitutionUser con rol GUARDIAN
### Vistas: InvitationPage, FamilyDashboard, FamilyLayout, AttendanceHistory

---

## Fase 3: Jornada en Vivo + Ficha de Salud (4 semanas)

**Objetivo:** Las cuidadoras de maternal registran eventos rápidamente, los padres ven timeline en vivo, y las fichas médicas previenen emergencias.

**Dependencias:** Fase 2 (el padre necesita ver la jornada)

### User Stories

**PAR-016: Registro rápido de evento en jornada** (MUST, XL)
- Como cuidadora de maternal, quiero registrar alimentación, siesta, pañal, actividad e incidente con botones rápidos (<15 segundos).
- Criterios:
  - [ ] Vista de grupo con botones grandes: Alimento, Siesta, Pañal, Actividad, Incidente, Foto
  - [ ] Al tocar: mini-formulario contextual (hora, notas, foto opcional)
  - [ ] Cada registro se vincula a la sesión del día y al alumno

**PAR-017: Timeline del día (vista padre)** (MUST, L)
- Como padre de maternal, quiero ver una timeline cronológica de todo lo que pasó con mi hijo hoy.
- Criterios:
  - [ ] Cards con ícono por tipo, hora, descripción
  - [ ] Actualización al refrescar (sin real-time en Fase 3)
  - [ ] Fotos inline si las hay

**PAR-018: Ficha de salud del alumno** (MUST, M)
- Como coordinadora, quiero registrar alergias, medicamentos y condiciones médicas de cada alumno.
- Criterios:
  - [ ] Sección en perfil del alumno
  - [ ] Campos: tipo de sangre, alergias (lista), medicamentos autorizados, restricciones alimentarias, pediatra
  - [ ] Editable por staff y por padre (desde su portal)

**PAR-019: Alerta de salud visible para la maestra** (MUST, M)
- Como cuidadora, quiero ver un badge de alerta cuando un alumno tiene condiciones médicas, para no cometer errores.
- Criterios:
  - [ ] Badge visible en lista de alumnos del grupo
  - [ ] Al registrar alimentación: warning si tiene restricción alimentaria
  - [ ] Al registrar medicamento: verificar que está en la lista autorizada

**PAR-020: Registro de alimentación detallado** (MUST, M)
- Hora, tipo (biberón/sólido/snack), cantidad, aceptación, notas

**PAR-021: Registro de siesta** (MUST, S)
- Hora inicio, hora fin, duración, calidad, notas

**PAR-022: Registro de pañal/higiene** (MUST, S)
- Hora, tipo, notas

**PAR-023: Registro de actividad** (MUST, S)
- Hora, tipo (motriz/sensorial/música/arte), descripción, participación del alumno

**PAR-024: Registro de incidente** (MUST, M)
- Hora, tipo (caída/mordida/fiebre), severidad, descripción, acción tomada, requiere seguimiento

### Entidades: daylog_entry, student_health_profile, student_health_condition
### Vistas: LiveDaylogView, DaylogTimeline (padre), HealthProfileSection

---

## Fase 4: Comunicación Contextual (4 semanas)

**Objetivo:** Toda comunicación padres-escuela ocurre dentro de la plataforma, siempre vinculada a un contexto.

**Dependencias:** Fase 2 (padres con cuenta)

### User Stories

**PAR-025: Crear observación individual** (MUST, M)
- Como maestra, quiero enviar una observación sobre un alumno a sus tutores, vinculada a la sesión del día.

**PAR-026: Reportar incidente con acuse de recibo** (MUST, L)
- Como maestra, quiero reportar un incidente que requiera confirmación de lectura del padre.
- Criterios:
  - [ ] Acuse de recibo obligatorio
  - [ ] Si no se confirma en 48h, escalar a coordinación
  - [ ] Log de auditoría completo

**PAR-027: Enviar comunicado institucional** (MUST, L)
- Como directora, quiero enviar un comunicado a todos los padres de un grupo/campus/institución.
- Criterios:
  - [ ] Broadcast con tracking de lectura
  - [ ] Dashboard: "28 de 32 familias leyeron"
  - [ ] Adjuntos (PDF, imagen)

**PAR-028: Padre responde en contexto** (MUST, M)
- Como padre, quiero responder a una observación o incidente dentro del mismo hilo.

**PAR-029: Padre inicia mensaje directo** (SHOULD, M)
- Como padre, quiero enviar un mensaje a la maestra, siempre vinculado a uno de mis hijos.
- Criterios:
  - [ ] Seleccionar contexto: "Sobre la clase de hoy", "Sobre mi hijo", "Pregunta general"
  - [ ] Respetar horarios de comunicación

**PAR-030: Read receipts** (MUST, S)
- Indicador de "leído" en cada mensaje

**PAR-031: Horarios de comunicación** (SHOULD, M)
- La escuela configura ventanas de comunicación. Mensajes fuera de horario se encolan.

**PAR-032: Historial de mensajes buscable** (SHOULD, M)
- Buscar en hilos por texto, filtrar por tipo

**PAR-033: Adjuntos en mensajes** (SHOULD, M)
- Subir fotos y PDFs en mensajes

**PAR-034: Retirar mensaje** (COULD, S)
- Staff puede retirar un mensaje. Se reemplaza texto pero se mantiene en auditoría.

**PAR-035: Exportar hilo a PDF** (SHOULD, M)
- Para evidencia legal: exportar conversación completa con timestamps y status de lectura.

### Entidades: message_thread, message, message_recipient, message_attachment, communication_schedule, message_audit_log
### Vistas: ThreadListView, ThreadDetailView, ComposeModal, AnnouncementComposer

---

## Fase 5: Notificaciones + PWA (3 semanas)

**Objetivo:** El padre se entera sin abrir la app.

**Dependencias:** Fase 4 (genera las notificaciones)

### User Stories

**PAR-036: Notificaciones in-app** (MUST, M)
- Bell icon con badge, centro de notificaciones, mark as read

**PAR-037: Push notifications (Web Push)** (MUST, L)
- Service Worker, push subscription, envío vía Web Push API

**PAR-038: PWA manifest + instalable** (MUST, M)
- manifest.json, Service Worker, prompt de instalación

**PAR-039: Preferencias de notificación** (SHOULD, M)
- Por tipo de notificación: push sí/no, email sí/no

**PAR-040: Agrupación inteligente** (SHOULD, M)
- No spam: "5 fotos nuevas" en vez de 5 notificaciones separadas

**PAR-041: Horario silencioso** (COULD, S)
- No molestar entre 9pm-7am (configurable)

**PAR-042: Notificación urgente no silenciable** (MUST, S)
- INCIDENT y ACKNOWLEDGMENT_REQUIRED ignoran modo silencioso

**PAR-043: Email como fallback** (SHOULD, M)
- Para notificaciones urgentes no leídas en 24h

### Entidades: notification, notification_preference, push_subscription
### Vistas: NotificationCenter, NotificationPreferences, PWA config

---

## Fase 6: Evidencia Fotográfica (3 semanas)

**Objetivo:** Las fotos viven en el sistema, taggeadas y con consentimiento.

**Dependencias:** Fase 3 (jornada en vivo genera fotos)

### User Stories

**PAR-044: Upload de fotos vinculadas a sesión** (MUST, L)
- Maestra sube fotos durante o después de la sesión

**PAR-045: Tagging de alumnos** (MUST, M)
- "Tap to tag": seleccionar alumnos que aparecen en la foto

**PAR-046: Consentimiento digital de imagen** (MUST, M)
- Padre da/revoca consentimiento desde su portal

**PAR-047: Galería del padre** (MUST, M)
- Solo fotos donde su hijo está taggeado + grupales con consentimiento

**PAR-048: Pre-signed URLs** (MUST, S)
- URLs con expiración de 1h, no públicas permanentes

**PAR-049: Thumbnails automáticos** (SHOULD, M)
- Generación de thumbnail 300x300 al subir

**PAR-050: MinIO para desarrollo, S3 para producción** (MUST, M)
- Adapter de storage S3-compatible

### Entidades: session_media, session_media_student_tag, guardian_consent
### Infra: MinIO en Docker Compose, S3 adapter

---

## Fase 7: Protección Legal e Inteligencia (4 semanas)

**Objetivo:** Features premium que protegen a la escuela y generan insights.

**Dependencias:** Fases 1-4 (necesita datos acumulados)

### User Stories

**PAR-051: Entrega Segura (Safe Pickup)** (MUST, L)
- Personas autorizadas con foto, QR temporal, log auditable

**PAR-052: Pase de lista por excepción** (MUST, S)
- Todos presentes por default, solo marcar ausencias

**PAR-053: Firma digital de reglamento** (SHOULD, L)
- Documentos con firma digital, timestamp, IP, dashboard de firmas

**PAR-054: Expediente digital con timeline** (SHOULD, L)
- Vista agregada automática de toda la data del alumno, exportable a PDF

**PAR-055: Alertas de deserción** (SHOULD, M)
- 3+ faltas → alerta a dirección con botón "Contactar familia"

**PAR-056: Resumen semanal "Mi Semana"** (COULD, M)
- Auto-generado cada viernes con foto destacada y resumen

**PAR-057: Comprobante mensual de servicios** (COULD, M)
- Reporte PDF auto-generado para evidencia ante PROFECO

**PAR-058-060: Cumplimiento normativo** (COULD, L)
- Checklists Protección Civil/SEP, simulacros, capacitaciones

---

## Paralelización posible

- Fase 3 (Jornada en Vivo) y Fase 4 (Comunicación) pueden desarrollarse en paralelo después de Fase 2
- Fase 5 (PWA) puede iniciar en paralelo con Fase 4 (solo necesita el sistema de notificaciones)
- Fase 6 (Fotos) puede iniciar en paralelo con Fase 5

## KPIs por fase

| Fase | KPI |
|------|-----|
| 1 | 100% de alumnos con al menos 1 tutor vinculado |
| 2 | % de tutores que aceptan invitación en <7 días |
| 3 | Tiempo promedio de registro de evento <15 segundos |
| 4 | % de comunicación que sale de WhatsApp al sistema |
| 5 | % de padres con push habilitado |
| 6 | Fotos por sesión promedio |
| 7 | % de escuelas con cumplimiento "verde" |
