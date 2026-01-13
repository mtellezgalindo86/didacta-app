-- Create Keycloak database (Didacta DB is created by POSTGRES_DB env var)
CREATE DATABASE keycloak;

-- Permissions
GRANT ALL PRIVILEGES ON DATABASE didacta TO didacta;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO didacta;
