-- Add fallback_email_index column to agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS fallback_email_index INTEGER;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_fallback_email 
ON agents(fallback_email_index) 
WHERE fallback_email_index IS NOT NULL;

-- Add constraint to ensure fallback_email_index is positive
ALTER TABLE agents 
ADD CONSTRAINT chk_fallback_email_index_positive 
CHECK (fallback_email_index IS NULL OR fallback_email_index > 0);

-- Update existing agents with fallback email indices (optional)
-- This assigns fallback emails to existing agents in order of creation
WITH numbered_agents AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM agents 
  WHERE fallback_email_index IS NULL 
  AND status = 'active'
)
UPDATE agents 
SET fallback_email_index = numbered_agents.row_num
FROM numbered_agents 
WHERE agents.id = numbered_agents.id;

-- Show current fallback email assignments
SELECT 
  id,
  company_name,
  email,
  fallback_email_index,
  CASE 
    WHEN fallback_email_index IS NOT NULL 
    THEN CONCAT('SALES_EMAIL_', fallback_email_index)
    ELSE 'No fallback assigned'
  END as fallback_env_var,
  status,
  created_at
FROM agents 
ORDER BY fallback_email_index NULLS LAST, created_at;
