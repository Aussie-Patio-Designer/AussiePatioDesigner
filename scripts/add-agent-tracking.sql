-- Add agent tracking to inquiries table
ALTER TABLE gazebo_inquiries 
ADD COLUMN IF NOT EXISTS agent_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS agent_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS source_url VARCHAR(500);

-- Create index for better performance when querying by agent
CREATE INDEX IF NOT EXISTS idx_gazebo_inquiries_agent_email 
ON gazebo_inquiries(agent_email);

-- Create index for source URL tracking
CREATE INDEX IF NOT EXISTS idx_gazebo_inquiries_source_url 
ON gazebo_inquiries(source_url);

-- Update existing inquiries to have a default source
UPDATE gazebo_inquiries 
SET source_url = 'https://aussie-patio-designer.vercel.app'
WHERE source_url IS NULL;
