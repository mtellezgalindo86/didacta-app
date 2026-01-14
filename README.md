# Didacta App (MVP)

Sistema de gestión escolar con arquitectura moderna basada en Spring Boot, React y Keycloak.

## 🏗 Arquitectura

- **Frontend**: React + Vite + TypeScript + TailwindCSS (`didacta-web`)
- **Backend API**: Spring Boot 3 + Java 17 (`didacta-api`)
- **Identidad**: Keycloak 24 (OIDC/OAuth2)
- **Base de Datos**: PostgreSQL 16
- **Infraestructura**: Docker Compose

---

## 🚀 Opción 1: Inicio Rápido (Modo Demo)
*Recomendado para ver la aplicación funcionando sin instalar dependencias de desarrollo.*

### Requisitos:
- Docker & Docker Compose

### Instrucciones:
1. clonar el repositorio y ejecutar:
   ```bash
   docker compose up --build
   ```
2. Esperar unos minutos. La primera vez descargará imágenes y compilará todo.

---

## 🛠 Opción 2: Modo Desarrollador (Híbrido)
*Recomendado para trabajar en el código ("A como lo tenemos ahorita").*

### Requisitos:
- Java 17+
- Node.js 18+
- Docker (solo para infraestructura)

### 1. Levantar Infraestructura (Base de Datos & Keycloak)
En una terminal:
```bash
docker compose up -d postgres keycloak
```
*Esto corre PostgreSQL en puerto `5432` y Keycloak en `8081`.*

### 2. Ejecutar Backend (API)
En otra terminal desde la carpeta `didacta-api`:
```bash
cd didacta-api
./gradlew bootRun
```
*El backend iniciará en `http://localhost:8088`.*

### 3. Ejecutar Frontend (Web)
En otra terminal desde la carpeta `didacta-web`:
```bash
cd didacta-web
npm install  # Solo la primera vez
npm run dev
```
*El frontend iniciará en `http://localhost:5173`.*

---

## 🔑 Acceso y Credenciales

### 1. Aplicación Web (Frontend)
- **URL**: [http://localhost:5173](http://localhost:5173)
- **Flujo**:
    1. Clic en **"Crear cuenta con Didacta"**.
    2. Registrarse en Keycloak.
    3. Completar el Onboarding (Institución -> Grupo -> Colaboradores).

### 2. Panel de Administración (Keycloak)
- **URL**: [http://localhost:8081](http://localhost:8081)
- **Usuario**: `admin`
- **Contraseña**: `admin`
- **Realm**: `didacta`

### 3. API & Documentación
- **Swagger UI**: [http://localhost:8088/swagger-ui.html](http://localhost:8088/swagger-ui.html) (Si el backend está corriendo)

---

## ⚠️ Solución de Problemas Comunes

- **Error 500 al crear cuenta**: Asegúrese de que el backend terminó de iniciar completamente antes de intentar el registro.
- **Keycloak no carga**: Verifique que el contenedor `didacta-keycloak` esté "healthy" (`docker ps`).
- **Problemas de CORS**: Asegúrese de acceder siempre por `localhost` y no `127.0.0.1` para mantener consistencia con los tokens.
