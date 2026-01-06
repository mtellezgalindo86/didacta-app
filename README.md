# Didacta API

Backend API for the Didacta platform, built with Spring Boot 3, Keycloak, and PostgreSQL.

## Prerequisites

- Java 21+
- Docker & Docker Compose

## Quick Start (Docker)

The fastest way to run the full stack (Database, Auth, API):

```bash
docker compose up -d
```

Services will be available at:
- **API**: http://localhost:8088
- **Keycloak**: http://localhost:8081 (admin/admin)
- **PostgreSQL**: localhost:5432

### Verify Installation
1. Check health:
   ```bash
   curl http://localhost:8088/api/health
   ```
2. Get a Token (Director):
   ```bash
   export TOKEN=$(curl -s -d "client_id=didacta-api" -d "username=director@didacta.local" -d "password=Didacta123!" -d "grant_type=password" http://localhost:8081/realms/didacta/protocol/openid-connect/token | jq -r .access_token)
   ```
3. Call Protected Endpoint:
   ```bash
   curl -H "Authorization: Bearer $TOKEN" http://localhost:8088/api/me
   ```

## Development

### Build
```bash
cd didacta-api
./gradlew clean build
```

### Run Locally (with Docker dependencies)
1. Start Infra only:
   ```bash
   docker compose up -d postgres keycloak
   ```
2. Run App:
   ```bash
   cd didacta-api
   ./gradlew bootRun
   ```

## Project Structure
- `didacta-api`: Spring Boot Application (Gradle)
- `infra`: Infrastructure config (Keycloak realms)
- `docker-compose.yml`: Local orchestrator

## API Endpoints
- `GET /api/health` - Public health check
- `GET /api/me` - Current user info (Auth required)
- `POST /api/sessions` - Create session
- `GET /api/sessions` - List sessions (Tenant filtered)
