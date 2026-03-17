# Fase 1: Guardian + Vinculación - 17 Tareas Atómicas

## Grafo de dependencias

```
TASK-01 (migration)     TASK-03 (DTOs)     TASK-06 (Student findById)
  |                        |                    |
  v                        |                    |
TASK-02 (entidades)        |                    |
  |                        |                    |
  v                        |                    |
TASK-04 (output ports)     |                    |
  |                        |                    |
  v                        |                    |
TASK-05 (JPA + adapters)   |                    |
  |                        |                    |
  v                        v                    |
TASK-07 (input port)    TASK-08 (mapper)        |
  |                        |                    |
  +--------+---------------+--------------------+
           |
           v
       TASK-09 (ManageGuardiansService)
           |
           v
       TASK-10 (Controller)
           |
           v
       TASK-11 (FE types + API)
        /     |      \
       v      v       v
   TASK-12  TASK-14  TASK-15
      |                |
      v                v
   TASK-13          TASK-16
       \              /
        v            v
       TASK-17 (rutas + sidebar)
```

## Paralelizables
- TASK-01, TASK-03, TASK-06 (sin dependencias entre sí)
- TASK-12, TASK-14, TASK-15 (solo dependen de TASK-11)
- TASK-13 y TASK-16 (no dependen entre sí)

---

## TASK-01: Migración V9 - tablas + datos legacy
**Story:** PAR-008 | **Tipo:** migration | **Depende de:** ninguna

**Archivos:**
- `didacta-api/src/main/resources/db/migration/V9__guardians.sql`

**Spec:**
- CREATE TABLE guardian: id, institution_id, first_name, last_name, phone (NOT NULL), email, app_user_id (nullable), status, tenant_id, timestamps
- UNIQUE INDEX: (institution_id, phone)
- CREATE TABLE student_guardian: id, student_id FK CASCADE, guardian_id FK CASCADE, relationship, is_primary, can_pick_up, receives_notifications, notes, tenant_id, timestamps
- UNIQUE: (student_id, guardian_id)
- Migrar datos: DISTINCT ON (institution_id, guardian_phone), split guardian_name en first/last, relationship='TUTOR', isPrimary=true

**Done:** [ ] Flyway aplica sin errores

---

## TASK-02: Entidades JPA - Guardian y StudentGuardian
**Story:** PAR-001,002 | **Tipo:** backend | **Depende de:** TASK-01

**Archivos:**
- `domain/model/Guardian.java` — @Entity @Table("guardian"), extiende BaseTenantEntity, campos: id, institutionId, firstName, lastName, phone, email, appUserId, status
- `domain/model/StudentGuardian.java` — @Entity @Table("student_guardian"), extiende BaseTenantEntity, campos: id, studentId, guardianId, relationship, isPrimary, canPickUp, receivesNotifications, notes

**Done:** [ ] Compila | [ ] Sigue patrón de Student.java (@Getter @Setter, UuidV7Generator)

---

## TASK-03: DTOs - GuardianCommand y GuardianResult
**Story:** PAR-001-007 | **Tipo:** backend | **Depende de:** ninguna

**Archivos:**
- `application/dto/GuardianCommand.java` — Create, Update, LinkStudent, UpdateLink, ChangeStatus con Bean Validation
- `application/dto/GuardianResult.java` — GuardianCreated, GuardianResponse, GuardianListItem, StudentLinkResponse, GuardianOfStudentResponse con @Builder @Data

**Done:** [ ] Compila | [ ] @Pattern para relationship y status

---

## TASK-04: Output ports
**Story:** infra | **Tipo:** backend | **Depende de:** TASK-02

**Archivos:**
- `application/port/output/GuardianRepositoryPort.java` — save, findById, findByInstitutionIdAndPhone, findByInstitutionIdAndFilters, existsByInstitutionIdAndPhoneAndIdNot
- `application/port/output/StudentGuardianRepositoryPort.java` — save, findById, findByStudentId, findByGuardianId, existsByStudentIdAndGuardianId, deleteById

**Done:** [ ] Compila

---

## TASK-05: JPA Repositories + Persistence Adapters
**Story:** infra | **Tipo:** backend | **Depende de:** TASK-02, TASK-04

**Archivos:**
- `infrastructure/.../repository/JpaGuardianRepository.java` — JpaRepository + @Query para filtros
- `infrastructure/.../repository/JpaStudentGuardianRepository.java` — JpaRepository
- `infrastructure/.../adapter/GuardianPersistenceAdapter.java` — implementa port
- `infrastructure/.../adapter/StudentGuardianPersistenceAdapter.java` — implementa port

**Done:** [ ] Compila | [ ] Adapters implementan todos los métodos

---

## TASK-06: Agregar findById a StudentRepositoryPort
**Story:** dependencia | **Tipo:** backend | **Depende de:** ninguna

**Archivos a MODIFICAR:**
- `application/port/output/StudentRepositoryPort.java` — agregar `Optional<Student> findById(UUID id)`
- `infrastructure/.../adapter/StudentPersistenceAdapter.java` — implementar con `jpaRepo.findById(id)`

**Done:** [ ] Compila

---

## TASK-07: Input port - ManageGuardiansUseCase
**Story:** PAR-001-007 | **Tipo:** backend | **Depende de:** TASK-03

**Archivos:**
- `application/port/input/ManageGuardiansUseCase.java` — 9 métodos: createAndLink, linkExistingToStudent, getGuardiansOfStudent, unlinkFromStudent, list, getById, update, updateLink, changeStatus

**Done:** [ ] Compila

---

## TASK-08: Mapper - GuardianMapper
**Story:** infra | **Tipo:** backend | **Depende de:** TASK-02, TASK-03

**Archivos:**
- `application/mapper/GuardianMapper.java` — métodos estáticos: toGuardianResponse, toGuardianListItem, toGuardianOfStudentResponse, toStudentLinkResponse

**Done:** [ ] Compila

---

## TASK-09: Use case - ManageGuardiansService (MÁS GRANDE)
**Story:** PAR-001-007 | **Tipo:** backend | **Depende de:** TASK-04,05,06,07,08

**Archivos:**
- `application/usecase/ManageGuardiansService.java` — ~200 líneas, implementa ManageGuardiansUseCase

**Lógica clave:**
- `normalizePhone()`: quitar espacios, guiones, paréntesis
- `createAndLink()`: dedup por phone, crear Guardian + StudentGuardian
- IDOR en todo: `guardian.institutionId == tenantProvider.getTenantUUID()`
- `update()`: si phone cambió, verificar no duplicado con `existsByInstitutionIdAndPhoneAndIdNot`

**Done:** [ ] Compila | [ ] Dedup funciona | [ ] IDOR en todas las ops

---

## TASK-10: Controller - GuardianController
**Story:** PAR-001-007 | **Tipo:** backend | **Depende de:** TASK-09

**Archivos:**
- `infrastructure/.../controller/GuardianController.java` — 9 endpoints

**Endpoints:**
```
POST   /api/guardians                         → 201
GET    /api/guardians?status=&search=          → 200
GET    /api/guardians/{id}                     → 200
PUT    /api/guardians/{id}                     → 200
PATCH  /api/guardians/{id}/status              → 204
POST   /api/guardians/{id}/students            → 201
PUT    /api/guardians/{id}/students/{linkId}   → 200
DELETE /api/guardians/{id}/students/{linkId}   → 204
GET    /api/students/{studentId}/guardians     → 200
```

**Done:** [ ] Compila | [ ] @Valid en bodies | [ ] Status codes correctos

---

## TASK-11: Frontend types + API service
**Story:** infra FE | **Tipo:** frontend | **Depende de:** TASK-10

**Archivos:**
- `didacta-web/src/types/guardian.ts` — interfaces TypeScript
- `didacta-web/src/api/guardianApi.ts` — funciones CRUD usando didactaApi

**Done:** [ ] `npx tsc --noEmit` pasa

---

## TASK-12: StudentListView (/alumnos)
**Story:** PAR-003,005 | **Tipo:** frontend | **Depende de:** TASK-11

**Archivos:**
- `didacta-web/src/views/students/StudentListView.tsx`

**Spec:** Lista de alumnos, búsqueda, click → /alumnos/:id. Patrón de StaffListView.

**Done:** [ ] Compila | [ ] Lista funcional | [ ] Navegación

---

## TASK-13: StudentProfileView (/alumnos/:id)
**Story:** PAR-003,001,004 | **Tipo:** frontend | **Depende de:** TASK-11, TASK-12

**Archivos:**
- `didacta-web/src/views/students/StudentProfileView.tsx`

**Spec:** Datos del alumno + sección "Tutores vinculados" con badges parentesco (MADRE=pink, PADRE=blue, ABUELO=amber, TÍO=purple, TUTOR=green), badges permisos, botón vincular (abre modal TASK-14), botón desvincular con confirmación.

**Done:** [ ] Compila | [ ] Muestra tutores | [ ] Desvincular funciona

---

## TASK-14: GuardianLinkModal
**Story:** PAR-001,002 | **Tipo:** frontend | **Depende de:** TASK-11

**Archivos:**
- `didacta-web/src/components/guardians/GuardianLinkModal.tsx`

**Spec:** Búsqueda por teléfono → si existe "Vincular este" → si no existe, formulario completo. Parentesco (select español), permisos (toggles). Botón "Guardar y vincular".

**Done:** [ ] Compila | [ ] Dedup funciona | [ ] Crear nuevo funciona

---

## TASK-15: GuardianListView (/tutores)
**Story:** PAR-005 | **Tipo:** frontend | **Depende de:** TASK-11

**Archivos:**
- `didacta-web/src/views/guardians/GuardianListView.tsx`

**Spec:** Directorio de tutores, búsqueda nombre/teléfono, hijos como badges, click → /tutores/:id.

**Done:** [ ] Compila | [ ] Lista funcional | [ ] Navegación

---

## TASK-16: GuardianProfileView + EditModal (/tutores/:id)
**Story:** PAR-006,007 | **Tipo:** frontend | **Depende de:** TASK-11, TASK-14

**Archivos:**
- `didacta-web/src/views/guardians/GuardianProfileView.tsx`
- `didacta-web/src/components/guardians/GuardianEditModal.tsx`

**Spec:** Datos contacto + hijos vinculados con badges. Editar (modal pre-llenado, validar phone 409). Desvincular hijo.

**Done:** [ ] Compila | [ ] Editar funciona | [ ] Error 409 manejado

---

## TASK-17: Rutas + Sidebar
**Story:** todas | **Tipo:** frontend | **Depende de:** TASK-12,13,15,16

**Archivos a MODIFICAR:**
- `didacta-web/src/App.tsx` — 4 rutas: /alumnos, /alumnos/:id, /tutores, /tutores/:id
- `didacta-web/src/views/DashboardLayout.tsx` — Activar "Alumnos" con onClick, agregar "Tutores" con ícono

**Done:** [ ] Compila | [ ] Navegación funciona | [ ] Active state en sidebar

---

## Resumen

| Tipo | Tareas | Esfuerzo |
|------|--------|----------|
| Migration | 1 (TASK-01) | S |
| Backend | 9 (TASK-02 a TASK-10) | M |
| Frontend | 7 (TASK-11 a TASK-17) | M-L |
| **Total** | **17 tareas** | **~3-4 días** |
