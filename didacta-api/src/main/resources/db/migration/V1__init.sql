CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    group_id UUID,
    title VARCHAR(255) NOT NULL,
    notes TEXT,
    status VARCHAR(50) NOT NULL,
    session_date DATE,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255)
);

CREATE INDEX idx_sessions_tenant ON sessions(tenant_id);
