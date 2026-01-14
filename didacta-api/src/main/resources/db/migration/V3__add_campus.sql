-- Create Campus table
CREATE TABLE campus (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_campus_institution FOREIGN KEY (institution_id) REFERENCES institution(id)
);

-- Populate default campuses for existing institutions
INSERT INTO campus (id, institution_id, name, created_at, updated_at)
SELECT gen_random_uuid(), id, 'Sede Principal', NOW(), NOW()
FROM institution;

-- Add campus_id to group_entity
ALTER TABLE group_entity ADD COLUMN campus_id UUID;

-- Update existing groups to link to their institution's new default campus
UPDATE group_entity g
SET campus_id = c.id
FROM campus c
WHERE g.institution_id = c.institution_id;

-- Make campus_id NOT NULL and add FK
ALTER TABLE group_entity ALTER COLUMN campus_id SET NOT NULL;
ALTER TABLE group_entity ADD CONSTRAINT fk_group_campus FOREIGN KEY (campus_id) REFERENCES campus(id);
