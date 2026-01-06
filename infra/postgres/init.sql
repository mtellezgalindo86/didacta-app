-- Create Keycloak database so we don't mix tables with Didacta API configuration
CREATE DATABASE keycloak;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO didacta;
