-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. App User (Synced from Keycloak)
CREATE TABLE app_user (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keycloak_user_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Institution (Tenant)
CREATE TABLE institution (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    main_level VARCHAR(50) NOT NULL, -- MATERNAL, PREESCOLAR, PRIMARIA, SECUNDARIA, MEDIA_SUPERIOR, MIXTO
    country VARCHAR(10),
    timezone VARCHAR(50),
    created_by_user_id UUID REFERENCES app_user(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Institution User (Membership)
CREATE TABLE institution_user (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institution(id),
    user_id UUID NOT NULL REFERENCES app_user(id),
    role VARCHAR(50) NOT NULL, -- OWNER, DIRECTOR, COORDINATOR, TEACHER
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PENDING, DISABLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(institution_id, user_id)
);

-- 4. Group (Classroom)
CREATE TABLE group_entity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institution(id),
    name VARCHAR(255) NOT NULL,
    grade_level VARCHAR(100),
    shift VARCHAR(50), -- MATUTINO, VESPERTINO, MIXTO
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Collaborator Pre-User (Invited users)
CREATE TABLE collaborator_preuser (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institution(id),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- TEACHER, COORDINATOR (Only these are invited typically)
    group_id UUID REFERENCES group_entity(id),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACTIVE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(institution_id, email)
);

-- Indexes for performance
CREATE INDEX idx_app_user_email ON app_user(email);
CREATE INDEX idx_institution_user_user_id ON institution_user(user_id);
CREATE INDEX idx_institution_user_institution_id ON institution_user(institution_id);
CREATE INDEX idx_group_institution_id ON group_entity(institution_id);
CREATE INDEX idx_collaborator_email ON collaborator_preuser(email);
