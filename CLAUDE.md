# Didacta SaaS (EduFlow 360°) - Convenciones de Desarrollo

Este archivo es la fuente de verdad para convenciones del proyecto. Tanto skills (`/commands`) como agentes (`/agents`) lo referencian automáticamente.

## Visión del Producto

**EduFlow 360°** es una plataforma SaaS modular que orquesta el aprendizaje, el cuidado y la capacitación como flujos de trabajo trazables. Convierte cada jornada, clase o sesión en evidencia clara y comunicación con contexto.

**NO administra instituciones. Administra procesos con evidencia, contexto y visibilidad.**

### Problema que resuelve
- Sobrecarga administrativa y burnout docente
- Comunicación fragmentada (WhatsApp, papel)
- Falta de evidencia ante reclamos
- Dirección sin visibilidad temprana
- Decisiones tardías con impacto financiero y académico

### Principios del producto
1. **La sesión es la unidad mínima de verdad**
2. **Todo deja evidencia auditable**
3. **Comunicación siempre con contexto**
4. **Un solo core con comportamientos por nivel educativo**
5. **Menos fricción, más claridad**

### Core funcional
Organizaciones → Usuarios con roles → Grupos → Horarios → **Sesión** (entidad central) → Evidencia, Observaciones, Comunicación, Alertas tempranas.

### Ediciones por nivel educativo
| Edición | Enfoque | Valor |
|---------|---------|-------|
| **Maternal** | Cuidado: jornadas con actividades, alimentación, sueño, higiene, incidentes | Tranquilidad del padre, protección institucional |
| **Preescolar** | Aprendizaje guiado: clases, habilidades, progreso, evidencia | Padres informados, menos fricción |
| **Primaria** | Seguimiento académico: clases por materia, tareas, tablero simple | Hábitos de responsabilidad |
| **Secundaria/Superior** | Autogestión: tableros Kanban, feedback estructurado | Disciplina y evidencia académica |
| **Empresarial** | Capacitación trazable: sesiones, skills, cumplimiento | Auditoría y métricas reales |

### Roles operativos
- **Docentes/Cuidadores**: registran sesiones en <1 minuto
- **Coordinación académica**: visibilidad de cumplimiento y riesgos
- **Dirección/Dueños**: visión operativa y alertas tempranas
- **Administración**: contexto completo para atención a padres

### MVP Oficial
Maternal + Preescolar con: sesiones, evidencia, comunicación contextual, roles y vista de dirección.
**Excluido del MVP**: pagos, IA, automatizaciones complejas.

### Documento de referencia completo
`EduFlow360_Definicion_Completa_Producto.pdf` en la raíz del proyecto.

## Stack técnico
- **Backend**: Spring Boot 3.2.2, Java 21, Spring Data JPA, Flyway, PostgreSQL 16, Lombok, SpringDoc
- **Frontend**: React 19, TypeScript, Vite 7, React Router 7, Axios, Keycloak-JS 26, TailwindCSS 3.4
- **Auth**: Keycloak 24, OAuth2/OIDC, JWT (validado con `NimbusJwtDecoder.withJwkSetUri()`)
- **Infra**: Docker Compose, PostgreSQL 16, Keycloak 24

## Idioma
- **Código** (variables, clases, métodos, DTOs, endpoints): inglés
- **UI** (labels, placeholders, mensajes, títulos): español
- **Commits y PRs**: inglés

## Arquitectura Backend - Hexagonal (Ports & Adapters)

### Estructura (`didacta-api/src/main/java/com/didacta/api/`)
```
domain/
├── common/
│   ├── BaseTenantEntity.java        // @MappedSuperclass con @TenantId, usa TenantIdHolder
│   ├── TenantIdHolder.java          // Supplier<String> estático, desacopla domain de infra
│   └── UuidV7Generator.java         // Generador de UUIDs v7
├── exception/
│   ├── DomainException.java
│   └── EntityNotFoundException.java
└── model/                           // Entidades JPA puras (sin dependencias a infra)
    ├── AppUser.java
    ├── Institution.java
    ├── InstitutionUser.java
    ├── Campus.java
    ├── GroupEntity.java
    ├── Student.java
    ├── Session.java
    ├── Attendance.java
    ├── AttendanceStatus.java
    ├── CollaboratorPreUser.java
    └── SchoolYear.java

application/
├── dto/
│   ├── OnboardingCommand.java       // Commands con Bean Validation (@Valid, @Pattern, @NotNull)
│   └── OnboardingResult.java        // DTOs de respuesta (builders con Lombok)
├── mapper/
│   ├── OnboardingMapper.java
│   └── StudentMapper.java
├── port/
│   ├── input/                       // Use cases (interfaces)
│   │   ├── CreateGroupUseCase.java
│   │   ├── CreateInstitutionUseCase.java
│   │   ├── GetCatalogDataUseCase.java
│   │   ├── GetInstitutionInfoUseCase.java
│   │   ├── GetOnboardingStatusUseCase.java
│   │   ├── ManageAttendanceUseCase.java
│   │   ├── ManageCollaboratorsUseCase.java
│   │   ├── ManageSessionsUseCase.java
│   │   └── ManageStudentsUseCase.java
│   └── output/                      // Repository ports (interfaces)
│       ├── AttendanceRepositoryPort.java
│       ├── CampusRepositoryPort.java
│       ├── CollaboratorRepositoryPort.java
│       ├── GroupRepositoryPort.java
│       ├── InstitutionRepositoryPort.java
│       ├── MembershipRepositoryPort.java
│       ├── SchoolYearRepositoryPort.java
│       ├── SessionRepositoryPort.java
│       ├── StudentRepositoryPort.java
│       ├── TenantProviderPort.java
│       └── UserRepositoryPort.java
└── usecase/                         // Implementaciones de use cases
    ├── CreateGroupService.java
    ├── CreateInstitutionService.java
    ├── GetCatalogDataService.java
    ├── GetInstitutionInfoService.java
    ├── GetOnboardingStatusService.java
    ├── ManageAttendanceService.java
    ├── ManageCollaboratorsService.java
    ├── ManageSessionsService.java
    └── ManageStudentsService.java

infrastructure/
├── adapter/
│   ├── input/web/
│   │   ├── GlobalExceptionHandler.java   // @RestControllerAdvice con catch-all
│   │   └── controller/
│   │       ├── CatalogController.java    // /api/catalogs/*
│   │       ├── HealthController.java     // /api/health
│   │       ├── OnboardingController.java // /api/me, /api/onboarding/*
│   │       └── SessionController.java    // /api/sessions
│   └── output/
│       ├── persistence/
│       │   ├── adapter/                  // Implementan *RepositoryPort
│       │   │   ├── AttendancePersistenceAdapter.java
│       │   │   ├── CampusPersistenceAdapter.java
│       │   │   ├── CollaboratorPersistenceAdapter.java
│       │   │   ├── GroupPersistenceAdapter.java
│       │   │   ├── InstitutionPersistenceAdapter.java
│       │   │   ├── MembershipPersistenceAdapter.java
│       │   │   ├── SchoolYearPersistenceAdapter.java
│       │   │   ├── SessionPersistenceAdapter.java
│       │   │   ├── StudentPersistenceAdapter.java
│       │   │   └── UserPersistenceAdapter.java
│       │   └── repository/              // JpaRepository interfaces
│       │       ├── Jpa*Repository.java  // (10 repos)
│       └── tenant/
│           └── TenantProviderAdapter.java  // Implementa TenantProviderPort
├── config/
│   ├── FilterConfig.java
│   ├── SecurityConfig.java           // OAuth2 resource server, filter chain ordering
│   ├── TenantIdHolderConfig.java     // Bridge: TenantIdHolder ← TenantContext
│   └── WebConfig.java                // CORS
└── security/
    ├── TenantContext.java             // ThreadLocal<String> para tenant_id
    ├── TenantIdentifierResolver.java  // Hibernate CurrentTenantIdentifierResolver
    ├── TenantInterceptor.java         // Filter: extrae X-Institution-Id, valida membership
    ├── UserSyncFilter.java            // Filter: sincroniza JWT → AppUser
    └── UserSyncService.java           // @Transactional service extraído del filter
```

### Reglas de dependencias (IMPORTANTE)
- `domain/` → NO depende de nada externo (ni application, ni infrastructure)
- `application/` → depende de `domain/`, NO de `infrastructure/`
- `infrastructure/` → depende de `domain/` y `application/`
- Use cases inyectan **ports** (interfaces), nunca repos JPA directamente
- `TenantIdHolder` (domain) se conecta a `TenantContext` (infra) via `TenantIdHolderConfig`

### Security filter chain (orden determinístico)
```
BearerTokenAuthenticationFilter → UserSyncFilter → TenantInterceptor → Controllers
```
- JWT se valida con `NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build()` (validación REAL, no fake)
- CSRF: explícitamente deshabilitado
- `@Transactional` NO funciona en servlet filters — por eso existe `UserSyncService`

## Estructura Frontend (`didacta-web/src/`)
```
api/
├── didactaApi.ts                    // Instancia Axios (JWT + X-Institution-Id automáticos)

auth/
├── keycloak.ts                      // Config Keycloak-JS

components/
├── AuthGuard.tsx                    // Protege rutas, maneja onboarding flow
├── InlineError.tsx                  // Error inline reutilizable
├── UserProfileMenu.tsx              // Menú de usuario
└── dashboard/
    ├── ChatBubble.tsx
    ├── EvidenceCard.tsx
    └── SessionListItem.tsx

views/
├── DashboardLayout.tsx              // Layout con sidebar
├── DashboardView.tsx                // Vista principal
├── LoadingView.tsx                  // Pantalla de carga
├── LoginView.tsx
└── onboarding/                      // Flujo de onboarding (5 pasos)
    ├── OnboardingLayout.tsx         // Layout compartido con progress bar
    ├── Step0Welcome.tsx             // Bienvenida (solo UI, no API)
    ├── Step1Institution.tsx         // Crear institución + campus
    ├── Step2Group.tsx               // Crear grupo (catálogo de grados dinámico)
    ├── Step3Students.tsx            // Agregar alumnos (bulk text input)
    ├── Step4Attendance.tsx          // Primera asistencia
    └── Step5Collaborator.tsx        // Invitar equipo (opcional)

utils/
├── editionLabels.ts
```

### Flujo de Onboarding
El `AuthGuard` controla la navegación del onboarding:
1. `GET /api/me` devuelve `nextStep`: `STEP_1` → `STEP_2` → `STEP_3` → `STEP_4` → `DONE`
2. Step-0 es solo bienvenida (no tiene backend step asociado)
3. El guard permite avanzar al step actual o anteriores, bloquea saltar pasos
4. Al completar step-4 (asistencia), el backend devuelve `DONE` y redirige al dashboard
5. Step-5 (colaboradores) es opcional, accesible desde step-4 completion

## Convenciones Backend

### Entidades
- IDs: `UUID` con `@GeneratedValue` usando `UuidV7Generator`
- Timestamps: `createdAt`, `updatedAt` con `@PrePersist`/`@PreUpdate` en `BaseTenantEntity`
- Lombok: `@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor`
- Multi-tenant: extender `BaseTenantEntity` (tiene `@TenantId` en campo `tenantId`)
- Tabla: `@Table(name = "snake_case_plural")`

### Ports & Adapters
- Crear **port** en `application/port/output/` como interface
- Crear **adapter** en `infrastructure/adapter/output/persistence/adapter/` implementando el port
- Crear **JPA repo** en `infrastructure/adapter/output/persistence/repository/`
- Use cases en `application/usecase/` inyectan ports, NUNCA repos JPA

### Use Cases (Servicios)
- `@Service` + `@RequiredArgsConstructor`
- Inyectar `TenantProviderPort` para obtener tenant UUID
- Lógica de negocio aquí, NO en controllers
- Validar tenant ownership en TODAS las operaciones (IDOR protection)
- Usar `existsBy*()` para validaciones en vez de cargar entidades completas

### Controllers
- `@RestController` + `@RequestMapping("/api/{plural-kebab-case}")`
- DTOs siempre, nunca exponer entidades
- `@Valid` en `@RequestBody` para Bean Validation
- `@AuthenticationPrincipal Jwt jwt` para obtener usuario autenticado

### DTOs
- Clases con Lombok `@Data` o Java records
- Jakarta Bean Validation: `@NotBlank`, `@NotNull`, `@Email`, `@Pattern`, etc.
- Pattern para enums: `@Pattern(regexp = "VALUE1|VALUE2|VALUE3")`

### Exception Handling
- `GlobalExceptionHandler` con `@RestControllerAdvice`
- Catch-all `Exception.class` handler → 500 sin stack trace
- `EntityNotFoundException` → 404
- `MethodArgumentNotValidException` → 400 con detalles de campo
- `AccessDeniedException` → 403

### Migraciones Flyway
- Ubicación: `didacta-api/src/main/resources/db/migration/`
- Formato: `V{n}__{descripcion_snake_case}.sql`
- PKs: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- Timestamps: `created_at TIMESTAMP DEFAULT now()`
- Multi-tenant: `tenant_id VARCHAR(36)` (referencia a institution.id como string)
- Migraciones actuales: V1 (init) → V2 (mvp_schema) → V3 (campus) → V4 (eduflow_360) → V5 (add_missing_columns)

## Convenciones Frontend

### Componentes React
- Funcionales con TypeScript strict (no `any`)
- Props: interface `{Nombre}Props`
- Estados: manejar loading, error, empty, data

### TailwindCSS
- **Primario: `blue-600` / `blue-700` hover** (NO usar indigo, se ve morado)
- Backgrounds: `gray-50` (page), `white` (cards)
- Cards: `bg-white rounded-xl shadow-sm p-6`
- Botón primario: `bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700`
- Botón secundario: `border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50`
- Focus rings: `focus:ring-2 focus:ring-blue-500`
- Badges: `bg-blue-50 text-blue-700` o `bg-blue-100 text-blue-800`
- Responsive: mobile-first con `sm:`, `md:`, `lg:`

### API calls
- Usar instancia `didactaApi` de `api/didactaApi.ts` (ya inyecta JWT y X-Institution-Id)
- No usar fetch nativo ni crear nuevas instancias Axios
- Base URL configurada en `.env.local`: `VITE_API_BASE_URL=http://localhost:8088`

### Rutas
- Rutas protegidas: dentro de `<Route element={<AuthGuard />}>` en `App.tsx`
- Dashboard: dentro de `<DashboardLayout>` con sidebar
- Onboarding: rutas directas bajo AuthGuard (sin DashboardLayout)

## Multi-tenancy
- Header: `X-Institution-Id` en cada request
- Backend: `TenantContext` (ThreadLocal) captura el header via `TenantInterceptor`
- `TenantInterceptor` valida que el usuario tenga membership activa en la institución
- Hibernate 6: `@TenantId` en `BaseTenantEntity.tenantId` para filtrado automático
- `TenantIdentifierResolver` implementa `CurrentTenantIdentifierResolver<String>`
- Frontend: `didactaApi` inyecta el header automáticamente desde `localStorage.getItem('didacta_institution_id')`
- Todas las queries tenant-scoped DEBEN filtrar por `institutionId` o usar `@TenantId`
- NUNCA exponer datos entre tenants (validar ownership en cada operación)

## Seguridad
- Auth: JWT de Keycloak, validado por Spring Security con `NimbusJwtDecoder`
- Filter chain: `BearerTokenAuthenticationFilter → UserSyncFilter → TenantInterceptor`
- Rutas públicas: `/api/health`, `/swagger-ui/**`, `/v3/api-docs/**`
- Todo lo demás requiere token válido
- Tenant isolation: NUNCA exponer datos entre tenants
- IDOR: Validar groupId, studentId, etc. pertenecen al tenant actual
- Catch-all exception handler: nunca exponer stack traces

## Entidades del dominio (V5 migration)
| Entidad | Tabla | Tenant-scoped | Notas |
|---------|-------|---------------|-------|
| AppUser | app_users | No | Vinculada a Keycloak via keycloak_user_id |
| Institution | institution | No | Organización raíz |
| InstitutionUser | institution_users | No | Membership: user ↔ institution + role |
| Campus | campuses | Sí | Sede/plantel de una institución |
| GroupEntity | groups | Sí | Grupo/clase dentro de un campus |
| Student | students | Sí | Alumno asignado a un grupo |
| Session | sessions | Sí | Sesión de clase/jornada |
| Attendance | attendances | Sí | Registro de asistencia |
| CollaboratorPreUser | collaborator_pre_users | Sí | Invitación pre-registro |
| SchoolYear | school_years | Sí | Ciclo escolar |

## API Endpoints actuales
| Método | Path | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check (público) |
| GET | `/api/me` | Estado del usuario + onboarding status |
| POST | `/api/onboarding/institution` | Crear institución + campus |
| GET | `/api/onboarding/institution-details` | Detalles para pre-fill |
| GET | `/api/onboarding/institution-level` | Nivel educativo |
| POST | `/api/onboarding/group` | Crear grupo |
| GET | `/api/onboarding/groups` | Listar grupos del tenant |
| GET | `/api/onboarding/campuses` | Listar campuses del tenant |
| POST | `/api/onboarding/students` | Crear alumnos (bulk) |
| GET | `/api/onboarding/students` | Listar alumnos del tenant |
| POST | `/api/onboarding/attendance` | Registrar asistencia |
| POST | `/api/onboarding/collaborators` | Invitar colaboradores |
| GET | `/api/catalogs/levels` | Catálogo de niveles |
| GET | `/api/catalogs/grades?level=` | Catálogo de grados por nivel |
| GET | `/api/catalogs/shifts` | Catálogo de turnos |
| GET | `/api/catalogs/roles` | Catálogo de roles |
| GET | `/api/catalogs/terminology?level=` | Terminología por nivel |

## Docker Compose
```
postgres:5432      → didacta-postgres (PostgreSQL 16)
keycloak:8080      → didacta-keycloak:8081 (Keycloak 24)
didacta-api:8080   → didacta-api:8088 (Spring Boot)
didacta-web:5173   → didacta-web:5173 (Vite dev server)
```
- Frontend volume-mounted: `./didacta-web:/app` (hot reload)
- API se reconstruye: `docker compose up --build -d didacta-api`

## Verificación
- Backend: `cd didacta-api && ./gradlew build -x test`
- Frontend: `cd didacta-web && npx tsc --noEmit`
- Tests: `cd didacta-api && ./gradlew test`

## Postman
- Colección: "Didacta API" en workspace de Postman (via MCP)
- Organizar requests en carpetas por dominio
- Variables: `{{baseUrl}}`, `{{token}}`, `{{institutionId}}`
- Body con datos realistas en español (nombres mexicanos)

## Pipeline de desarrollo
```
Brainstorm → PM → Architect → Designer → Backend + Frontend → Integrator → QA
```
Agentes en `.claude/agents/`, skills en `.claude/commands/`.
