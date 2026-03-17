# Módulo Alumnos CRUD - 14 Tareas Atómicas (PRIORIDAD 1)

## Inventario: Qué ya existe vs qué falta

### Ya existe (backend)
- `Student.java` entity con campos: id, institutionId, groupId, firstName, lastName, dateOfBirth, guardianName, guardianPhone, guardianEmail, status, enrollmentDate
- `StudentRepositoryPort` con: save, findByGroupId, findByInstitutionId, findById, existsByIdAndInstitutionId
- `StudentPersistenceAdapter` implementa todo
- `JpaStudentRepository` con queries básicas
- `ManageStudentsUseCase` con: create (bulk, onboarding), listByInstitution
- `ManageStudentsService` implementa lo anterior
- `StudentMapper` con toDto
- Tabla `student` en DB con columnas completas (NO se necesita migración)

### Ya existe (frontend)
- `StudentListView.tsx` - Lista con búsqueda y filtro por grupo (usa `/api/onboarding/students`)
- `StudentProfileView.tsx` - Perfil con sección de tutores vinculados
- Rutas `/alumnos` y `/alumnos/:id` configuradas en App.tsx
- Sidebar con "Alumnos" activo y navegable

### Qué falta
- **Backend**: Endpoints propios `/api/students/*`, DTOs dedicados, create individual, update, change group, change status, filtros por status/search/group
- **Frontend**: Botón "Agregar alumno", formulario de creación, formulario de edición, acción cambiar grupo, acción desactivar/reactivar, filtro por status, migrar de endpoints onboarding a endpoints propios

---

## Grafo de dependencias

```
TASK-01 (DTOs)         TASK-02 (repo port)
    |                      |
    v                      v
TASK-03 (input port)   TASK-04 (JPA + adapter)
    |                      |
    +----------+-----------+
               |
               v
         TASK-05 (Service)
               |
               v
         TASK-06 (Controller)
               |
               v
         TASK-07 (FE types + API)
            /     |      \
           v      v       v
     TASK-08  TASK-09  TASK-10
        |        |        |
        v        v        v
     TASK-11  TASK-12  TASK-13
               \   /
                v
           TASK-14 (integración tutor)
```

## Paralelizables
- TASK-01 y TASK-02 (sin dependencias entre sí)
- TASK-03 y TASK-04 (solo dependen de TASK-01 y TASK-02 respectivamente)
- TASK-08, TASK-09, TASK-10 (solo dependen de TASK-07)
- TASK-11, TASK-12, TASK-13 (no dependen entre sí)

---

## TASK-01: DTOs - StudentCommand y StudentResult
**Story:** ALU-001,002,003,004,005 | **Tipo:** backend | **Depende de:** ninguna

**Archivos:**
- `application/dto/StudentCommand.java` — DTOs de entrada con Bean Validation
- `application/dto/StudentResult.java` — DTOs de respuesta

**Spec StudentCommand:**
```java
public class StudentCommand {
    @Data
    public static class Create {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        @NotNull private UUID groupId;
        private LocalDate dateOfBirth;  // opcional
    }

    @Data
    public static class Update {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        private LocalDate dateOfBirth;
    }

    @Data
    public static class ChangeGroup {
        @NotNull private UUID groupId;
    }

    @Data
    public static class ChangeStatus {
        @NotBlank
        @Pattern(regexp = "ACTIVE|INACTIVE")
        private String status;
    }
}
```

**Spec StudentResult:**
```java
public class StudentResult {
    @Data @Builder
    public static class StudentResponse {
        private UUID id;
        private String firstName;
        private String lastName;
        private LocalDate dateOfBirth;
        private String status;
        private UUID groupId;
        private String groupName;
        private LocalDate enrollmentDate;
        private String createdAt;
    }

    @Data @Builder
    public static class StudentListItem {
        private UUID id;
        private String firstName;
        private String lastName;
        private String status;
        private UUID groupId;
        private String groupName;
        private int guardianCount;
    }
}
```

**Done:** [ ] Compila | [ ] @Pattern para status

---

## TASK-02: Ampliar StudentRepositoryPort
**Story:** ALU-001,004,006 | **Tipo:** backend | **Depende de:** ninguna

**Archivos a MODIFICAR:**
- `application/port/output/StudentRepositoryPort.java` — agregar métodos
- `infrastructure/.../repository/JpaStudentRepository.java` — agregar queries
- `infrastructure/.../adapter/StudentPersistenceAdapter.java` — implementar

**Métodos nuevos en port:**
```java
List<Student> findByInstitutionIdAndFilters(UUID institutionId, String status, String search, UUID groupId);
```

**Query en JpaStudentRepository (IMPORTANTE: usar CAST para evitar lower(bytea)):**
```java
@Query("SELECT s FROM Student s WHERE s.institutionId = :instId " +
       "AND (:status IS NULL OR s.status = :status) " +
       "AND (:groupId IS NULL OR s.groupId = :groupId) " +
       "AND (:search IS NULL OR " +
       "LOWER(s.firstName) LIKE LOWER(CONCAT('%', CAST(:search AS STRING), '%')) OR " +
       "LOWER(s.lastName) LIKE LOWER(CONCAT('%', CAST(:search AS STRING), '%')))")
List<Student> findByFilters(...);
```

**Done:** [ ] Compila | [ ] Query con filtros funciona

---

## TASK-03: Input port - Ampliar ManageStudentsUseCase
**Story:** ALU-001-007 | **Tipo:** backend | **Depende de:** TASK-01

**Archivos a MODIFICAR:**
- `application/port/input/ManageStudentsUseCase.java` — agregar métodos nuevos

**Métodos nuevos (mantener existentes):**
```java
StudentResult.StudentResponse createStudent(StudentCommand.Create command);
StudentResult.StudentResponse getById(UUID id);
List<StudentResult.StudentListItem> list(String status, String search, UUID groupId);
StudentResult.StudentResponse update(UUID id, StudentCommand.Update command);
void changeGroup(UUID id, StudentCommand.ChangeGroup command);
void changeStatus(UUID id, StudentCommand.ChangeStatus command);
```

**Done:** [ ] Compila

---

## TASK-04: Adapter - implementar nuevos métodos del port
**Story:** infra | **Tipo:** backend | **Depende de:** TASK-02

**Archivos a MODIFICAR:**
- `infrastructure/.../adapter/StudentPersistenceAdapter.java` — implementar `findByInstitutionIdAndFilters`

**Done:** [ ] Compila | [ ] Adapter implementa todos los métodos del port

---

## TASK-05: Service - Ampliar ManageStudentsService
**Story:** ALU-001-006 | **Tipo:** backend | **Depende de:** TASK-01, TASK-02, TASK-03, TASK-04

**Archivos a MODIFICAR:**
- `application/usecase/ManageStudentsService.java` — agregar implementación de métodos nuevos
- `application/mapper/StudentMapper.java` — agregar métodos para nuevos DTOs

**Lógica clave:**
- `createStudent()`: validar grupo existe y pertenece al tenant, crear con status ACTIVE, enrollmentDate = hoy
- `getById()`: validar que student pertenece al tenant (IDOR), cargar groupName
- `list()`: delegar a repo con filtros, enriquecer con groupName y guardianCount
- `update()`: validar IDOR, actualizar solo firstName, lastName, dateOfBirth
- `changeGroup()`: validar IDOR, validar nuevo grupo pertenece al tenant, actualizar groupId
- `changeStatus()`: validar IDOR, actualizar status
- **guardianCount**: Usar `StudentGuardianRepositoryPort.findByStudentId().size()` o agregar `countByStudentId` si no existe

**Done:** [ ] Compila | [ ] IDOR en todas las ops | [ ] enrollmentDate automático

---

## TASK-06: Controller - StudentController
**Story:** ALU-001-006 | **Tipo:** backend | **Depende de:** TASK-05

**Archivos:**
- `infrastructure/.../controller/StudentController.java` — NUEVO controller

**Endpoints:**
```
POST   /api/students                         → 201
GET    /api/students                          → 200  (?status=&search=&groupId=)
GET    /api/students/{id}                     → 200
PUT    /api/students/{id}                     → 200
PATCH  /api/students/{id}/group               → 204
PATCH  /api/students/{id}/status              → 204
```

**Nota:** Los endpoints `/api/onboarding/students` siguen funcionando. Los nuevos son independientes.

**Done:** [ ] Compila | [ ] @Valid en bodies | [ ] Status codes correctos

---

## TASK-07: Frontend types + API service
**Story:** infra FE | **Tipo:** frontend | **Depende de:** TASK-06

**Archivos:**
- `didacta-web/src/types/student.ts` — interfaces TypeScript
- `didacta-web/src/api/studentApi.ts` — funciones CRUD usando didactaApi

**Spec types:**
```typescript
export interface StudentResponse {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  status: string;
  groupId: string;
  groupName: string | null;
  enrollmentDate: string;
  createdAt: string;
}

export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  groupId: string;
  groupName: string | null;
  guardianCount: number;
}

export interface CreateStudentPayload {
  firstName: string;
  lastName: string;
  groupId: string;
  dateOfBirth?: string;
}

export interface UpdateStudentPayload {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
}
```

**Spec API:**
```typescript
createStudent(data: CreateStudentPayload): Promise<StudentResponse>
listStudents(params?: { status?: string; search?: string; groupId?: string }): Promise<StudentListItem[]>
getStudent(id: string): Promise<StudentResponse>
updateStudent(id: string, data: UpdateStudentPayload): Promise<StudentResponse>
changeStudentGroup(id: string, groupId: string): Promise<void>
changeStudentStatus(id: string, status: string): Promise<void>
```

**Done:** [ ] `npx tsc --noEmit` pasa

---

## TASK-08: StudentCreateModal
**Story:** ALU-001 | **Tipo:** frontend | **Depende de:** TASK-07

**Archivos:**
- `didacta-web/src/components/students/StudentCreateModal.tsx`

**Spec:**
- Modal con formulario: firstName (required), lastName (required), groupId (select, required), dateOfBirth (date picker, opcional)
- Select de grupo cargado desde `/api/onboarding/groups`
- Validación client-side: campos required no vacíos
- Al guardar: POST `/api/students`, cerrar modal, callback `onSuccess`
- Manejar errores 400 y mostrar inline

**Done:** [ ] Compila | [ ] Crear funciona | [ ] Errores visibles

---

## TASK-09: StudentEditModal
**Story:** ALU-002 | **Tipo:** frontend | **Depende de:** TASK-07

**Archivos:**
- `didacta-web/src/components/students/StudentEditModal.tsx`

**Spec:**
- Modal pre-llenado con datos actuales del alumno
- Campos editables: firstName, lastName, dateOfBirth
- NO editable: grupo (eso es TASK-10 con acción separada)
- Al guardar: PUT `/api/students/{id}`, cerrar modal, callback `onSuccess`

**Done:** [ ] Compila | [ ] Pre-llena datos | [ ] Actualiza correctamente

---

## TASK-10: ChangeGroupModal
**Story:** ALU-003 | **Tipo:** frontend | **Depende de:** TASK-07

**Archivos:**
- `didacta-web/src/components/students/ChangeGroupModal.tsx`

**Spec:**
- Modal con select de grupos
- Muestra grupo actual (visual) y nuevo grupo (select)
- Confirmación: "Vas a mover a [nombre] de [grupo actual] a [grupo nuevo]"
- Al confirmar: PATCH `/api/students/{id}/group`

**Done:** [ ] Compila | [ ] Cambio funciona | [ ] Confirmación visible

---

## TASK-11: Mejorar StudentListView
**Story:** ALU-001,004,006 | **Tipo:** frontend | **Depende de:** TASK-07, TASK-08

**Archivos a MODIFICAR:**
- `didacta-web/src/views/students/StudentListView.tsx`

**Cambios:**
1. Migrar de `/api/onboarding/students` a `listStudents()` de studentApi
2. Agregar botón "Agregar alumno" en header (abre StudentCreateModal)
3. Agregar filtro por status (select: Todos / Activos / Inactivos), default "Activos"
4. Mostrar badge de status (verde=ACTIVE, gris=INACTIVE) en cada fila
5. Mostrar guardianCount como número en columna "Tutores"
6. Mejorar empty state: botón "Agregar primer alumno" que abre el modal

**Done:** [ ] Compila | [ ] Filtro status funciona | [ ] Botón crear funciona | [ ] guardianCount visible

---

## TASK-12: Mejorar StudentProfileView
**Story:** ALU-002,003,004,005 | **Tipo:** frontend | **Depende de:** TASK-07, TASK-09, TASK-10

**Archivos a MODIFICAR:**
- `didacta-web/src/views/students/StudentProfileView.tsx`

**Cambios:**
1. Migrar de `/api/onboarding/students` a `getStudent(id)` de studentApi
2. Mostrar más datos: dateOfBirth, enrollmentDate, status badge
3. Agregar botón "Editar" en header card (abre StudentEditModal)
4. Agregar botón "Cambiar grupo" (abre ChangeGroupModal)
5. Agregar botón "Desactivar" / "Reactivar" según status actual
   - Desactivar: confirmación "El alumno dejará de aparecer en listas activas"
   - Reactivar: PATCH directo
6. Si alumno INACTIVE: mostrar banner amarillo "Este alumno está inactivo"

**Done:** [ ] Compila | [ ] Editar funciona | [ ] Cambiar grupo funciona | [ ] Desactivar/Reactivar funciona

---

## TASK-13: Verificar StudentGuardianRepositoryPort.countByStudentId
**Story:** ALU-006 | **Tipo:** backend | **Depende de:** TASK-05

**Archivos a VERIFICAR/MODIFICAR:**
- `application/port/output/StudentGuardianRepositoryPort.java`
- `infrastructure/.../repository/JpaStudentGuardianRepository.java`
- `infrastructure/.../adapter/StudentGuardianPersistenceAdapter.java`

**Spec:** Se necesita `long countByStudentId(UUID studentId)` para que el servicio de students pueda incluir `guardianCount` en la lista.

**Done:** [ ] Método existe o fue agregado | [ ] Compila

---

## TASK-14: Crear alumno desde flujo de tutor (GuardianLinkModal)
**Story:** ALU-007 | **Tipo:** frontend | **Depende de:** TASK-07, TASK-08

**Archivos a MODIFICAR:**
- `didacta-web/src/components/guardians/GuardianLinkModal.tsx`
- Potencialmente `LinkStudentToGuardianModal.tsx`

**Cambios:**
- Cuando el usuario va a vincular un tutor a un alumno pero el alumno no existe, mostrar botón "¿El alumno no existe? Créalo aquí"
- Al hacer click: abrir StudentCreateModal (reusar TASK-08)
- Al crear el alumno exitosamente: seleccionarlo automáticamente en el flujo de vinculación

**Done:** [ ] Compila | [ ] Crear alumno desde flujo tutor funciona

---

## Resumen

| Tipo | Tareas | Esfuerzo |
|------|--------|----------|
| Backend DTOs/Ports | 4 (TASK-01 a TASK-04) | S |
| Backend Service+Controller | 3 (TASK-05, TASK-06, TASK-13) | M |
| Frontend types+API | 1 (TASK-07) | S |
| Frontend modals | 3 (TASK-08, TASK-09, TASK-10) | M |
| Frontend views | 2 (TASK-11, TASK-12) | M |
| Frontend integración | 1 (TASK-14) | S |
| **Total** | **14 tareas** | **~2-3 días** |

## Notas de implementación

1. **No hay migración de DB**: La tabla `student` ya tiene todos los campos necesarios. No se necesita V10.
2. **Endpoints de onboarding no se tocan**: `/api/onboarding/students` siguen funcionando. Los nuevos `/api/students/*` son independientes.
3. **IDOR en todo**: Cada operación valida que el student pertenece al tenant actual.
4. **Campos legacy**: `guardianName`, `guardianPhone`, `guardianEmail` en Student no se exponen en DTOs nuevos. La relación con tutores es via `student_guardian`.
5. **JPQL lower(bytea) fix**: Usar CAST(:search AS STRING) en queries para evitar el bug de PostgreSQL.
