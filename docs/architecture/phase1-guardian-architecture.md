# Fase 1: Guardian + Vinculación - Arquitectura Técnica

## Modelo de datos

### Guardian (tabla: guardian)

| Campo | Tipo | Nullable | Notas |
|-------|------|----------|-------|
| id | UUID | PK | UuidV7Generator |
| institution_id | UUID | NOT NULL | FK institution(id) |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| phone | VARCHAR(50) | NOT NULL | Clave de deduplicación |
| email | VARCHAR(255) | nullable | |
| app_user_id | UUID | nullable | FK app_user(id), se llena en Fase 2 |
| status | VARCHAR(20) | NOT NULL | ACTIVE, INACTIVE |
| tenant_id | VARCHAR(255) | NOT NULL | BaseTenantEntity |

Índice único: `(institution_id, phone)` — deduplicación por teléfono.

### StudentGuardian (tabla: student_guardian)

| Campo | Tipo | Nullable | Notas |
|-------|------|----------|-------|
| id | UUID | PK | UuidV7Generator |
| student_id | UUID | NOT NULL | FK student(id) ON DELETE CASCADE |
| guardian_id | UUID | NOT NULL | FK guardian(id) ON DELETE CASCADE |
| relationship | VARCHAR(30) | NOT NULL | MOTHER, FATHER, GRANDFATHER, GRANDMOTHER, UNCLE, AUNT, SIBLING, TUTOR, OTHER |
| is_primary | BOOLEAN | NOT NULL | DEFAULT false |
| can_pick_up | BOOLEAN | NOT NULL | DEFAULT true |
| receives_notifications | BOOLEAN | NOT NULL | DEFAULT true |
| notes | VARCHAR(500) | nullable | |
| tenant_id | VARCHAR(255) | NOT NULL | BaseTenantEntity |

Constraint único: `(student_id, guardian_id)`

### Diagrama de relaciones

```
Institution (1) ──< Guardian (N)
                        │
Student (N) ──< StudentGuardian >── Guardian (N)
                    │
                    ├─ relationship
                    ├─ is_primary
                    ├─ can_pick_up
                    └─ receives_notifications

Guardian ──? AppUser (0..1 via app_user_id, se vincula en Fase 2)
```

### Campos deprecados en Student
Los campos `guardian_name`, `guardian_phone`, `guardian_email` se mantienen (no se borran). La migración V9 crea guardians a partir de ellos.

---

## Migración V9

```sql
-- 1. Guardian table
CREATE TABLE guardian (...)
-- Índice único: (institution_id, phone)

-- 2. Student-Guardian relationship
CREATE TABLE student_guardian (...)
-- Constraint: uq_student_guardian (student_id, guardian_id)

-- 3. Migrar datos legacy
-- DISTINCT ON (institution_id, guardian_phone) para deduplicar
-- Relación por defecto: TUTOR, isPrimary=true, canPickUp=true
```

---

## Archivos a crear (15 nuevos + 2 modificados)

### Backend (base: didacta-api/src/main/java/com/didacta/api/)

| # | Capa | Archivo | Descripción |
|---|------|---------|-------------|
| 1 | Migration | `src/main/resources/db/migration/V9__guardians.sql` | Tablas + migración datos |
| 2 | Domain | `domain/model/Guardian.java` | Entidad JPA |
| 3 | Domain | `domain/model/StudentGuardian.java` | Entidad JPA relación |
| 4 | DTO | `application/dto/GuardianCommand.java` | Create, Update, LinkStudent, UpdateLink, ChangeStatus |
| 5 | DTO | `application/dto/GuardianResult.java` | GuardianResponse, GuardianListResponse, StudentLinkResponse, GuardianOfStudentResponse |
| 6 | Port In | `application/port/input/ManageGuardiansUseCase.java` | Interface con 10 métodos |
| 7 | Port Out | `application/port/output/GuardianRepositoryPort.java` | CRUD + findByFilters + findByInstitutionIdAndPhone |
| 8 | Port Out | `application/port/output/StudentGuardianRepositoryPort.java` | CRUD + findByStudentId/GuardianId |
| 9 | Mapper | `application/mapper/GuardianMapper.java` | Conversión entity ↔ DTO |
| 10 | UseCase | `application/usecase/ManageGuardiansService.java` | Lógica de negocio completa |
| 11 | Controller | `infrastructure/.../controller/GuardianController.java` | 9 endpoints REST |
| 12 | JPA | `infrastructure/.../repository/JpaGuardianRepository.java` | JpaRepository + queries |
| 13 | JPA | `infrastructure/.../repository/JpaStudentGuardianRepository.java` | JpaRepository |
| 14 | Adapter | `infrastructure/.../adapter/GuardianPersistenceAdapter.java` | Implementa port |
| 15 | Adapter | `infrastructure/.../adapter/StudentGuardianPersistenceAdapter.java` | Implementa port |

### Archivos modificados
| # | Archivo | Cambio |
|---|---------|--------|
| 16 | `application/port/output/StudentRepositoryPort.java` | Agregar `findById(UUID)` |
| 17 | `infrastructure/.../adapter/StudentPersistenceAdapter.java` | Implementar `findById` |

---

## Endpoints API

| Método | Path | Body/Params | Response | Status |
|--------|------|-------------|----------|--------|
| POST | `/api/guardians` | GuardianCommand.Create | GuardianCreated | 201 |
| GET | `/api/guardians` | `?status=&search=&studentId=` | GuardianListResponse | 200 |
| GET | `/api/guardians/{id}` | - | GuardianResponse (con students) | 200 |
| PUT | `/api/guardians/{id}` | GuardianCommand.Update | GuardianResponse | 200 |
| PATCH | `/api/guardians/{id}/status` | GuardianCommand.ChangeStatus | - | 204 |
| POST | `/api/guardians/{id}/students` | GuardianCommand.LinkStudent | StudentLinkResponse | 201 |
| PUT | `/api/guardians/{id}/students/{linkId}` | GuardianCommand.UpdateLink | - | 200 |
| DELETE | `/api/guardians/{id}/students/{linkId}` | - | - | 204 |
| GET | `/api/students/{studentId}/guardians` | - | List<GuardianOfStudentResponse> | 200 |

---

## Lógica de negocio clave

### Deduplicación por teléfono
Al crear guardian: buscar por `findByInstitutionIdAndPhone(institutionId, phone)`. Si existe, retornar `GuardianCreated(id, alreadyExisted=true)`. Frontend decide si vincular.

### Normalización de teléfono
Quitar espacios, guiones, paréntesis antes de guardar y buscar.

### IDOR Protection
Toda operación valida que guardian/student/link pertenece al tenant actual via `institutionId == tenantProvider.getInstitutionId()`.

### Edge cases
- Crear guardian con phone duplicado: no es error, retorna existente
- Desvincular último guardian: se permite
- Cambiar phone a uno que ya existe: error 409
- Guardian con app_user_id: siempre null en Fase 1

---

## Frontend

### Vistas nuevas
| Ruta | Componente |
|------|-----------|
| `/alumnos` | StudentListView |
| `/alumnos/:id` | StudentProfileView |
| `/tutores` | GuardianListView |
| `/tutores/:id` | GuardianProfileView |

### Componentes nuevos
| Componente | Descripción |
|-----------|-------------|
| GuardianLinkModal | Modal buscar/crear tutor + parentesco + permisos |
| StudentLinkModal | Modal vincular hijo desde perfil tutor |
| GuardianEditModal | Editar datos del tutor |
| RelationshipBadge | Badge color por parentesco |
| PermissionBadges | Badges de permisos (primario, recoger, notificaciones) |

### Sidebar
- Activar "Alumnos" existente → `/alumnos`
- Agregar "Tutores" debajo → `/tutores`

### Badges de parentesco
| Parentesco | Color |
|------------|-------|
| MADRE | pink |
| PADRE | blue |
| ABUELO/A | amber |
| TÍO/A | purple |
| TUTOR | green |
| OTRO | gray |
