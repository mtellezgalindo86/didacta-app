# Didacta App (MVP)

Sistema de gestión escolar con arquitectura moderna basada en Spring Boot, React y Keycloak.

## Arquitectura

- **Frontend**: React + Vite + TypeScript + TailwindCSS (`didacta-web`)
- **Backend API**: Spring Boot 3 + Java 21 (`didacta-api`)
- **Identidad**: Keycloak 24 (OIDC/OAuth2)
- **Base de Datos**: PostgreSQL 16
- **Infraestructura**: Docker Compose

## Requisitos Previos

- Docker & Docker Compose
- Node.js 18+ (Opcional, para desarrollo local)
- Java 17 (Opcional, para desarrollo local)

## Instrucciones de Inicio

1. **Levantar la infraestructura completa:**
   ```bash
   docker compose up --build
   ```
   *Nota: La primera vez tomará unos minutos mientras se descargan imágenes y se compilan los servicios.*

2. **Acceder a los servicios:**
   - **Frontend (Web)**: [http://localhost:5173](http://localhost:5173)
   - **Keycloak (Auth)**: [http://localhost:8081](http://localhost:8081)
     - Usuario admin: `admin` / `admin`
     - Realm configurado: `didacta`
   - **API (Backend)**: [http://localhost:8088](http://localhost:8088)
     - Swagger UI (si habilitado): [http://localhost:8088/swagger-ui.html](http://localhost:8088/swagger-ui.html)

## Flujo de Prueba (Onboarding)

1. Abrir `http://localhost:5173`
2. Clic en **"Crear cuenta con Didacta"**.
3. Completar registro en Keycloak (Nombre, Email, Password, seleccionar Rol).
   - *Nota: Asegúrese de usar un email válido formato, aunque no se envíe correo real.*
4. Tras registro, será redirigido al **Onboarding**.
5. **Paso 1: Institución** - Crear su institución.
6. **Paso 2: Grupo** - Crear su primer grupo.
7. **Paso 3: Colaboradores** - Agregar profesores (simulado).
8. **Dashboard** - Ver pantalla principal.

## Desarrollo

### Estructura de Proyecto
- `/didacta-api`: Código fuente Backend.
- `/didacta-web`: Código fuente Frontend.
- `/infra`: Configuraciones de infraestructura (Keycloak themes, Postgres schemas).

### Comandos Útiles
- Reiniciar solo backend: `docker compose restart didacta-api`
- Ver logs: `docker compose logs -f`
