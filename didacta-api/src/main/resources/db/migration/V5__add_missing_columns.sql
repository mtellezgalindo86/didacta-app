-- Add created_by column to attendance (required by BaseTenantEntity)
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
