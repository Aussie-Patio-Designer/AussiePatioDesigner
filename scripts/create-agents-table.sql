-- Create agents table for managing sales agents
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  sales_email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  website VARCHAR(255),
  name VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_sales_email ON agents(sales_email);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);

-- Add agent tracking to gazebo_inquiries table
ALTER TABLE gazebo_inquiries 
ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES agents(id),
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(10,2);

-- Create index for agent inquiries
CREATE INDEX IF NOT EXISTS idx_gazebo_inquiries_agent_id ON gazebo_inquiries(agent_id);

-- Insert sample agent data (optional)
INSERT INTO agents (company_name, contact_name, contact_email, sales_email, name, status)
VALUES 
  ('Demo Agency Ltd', 'John Smith', 'john@demoagency.com', 'sales@demoagency.com', 'demo-agency', 'active'),
  ('Builder Partners Co', 'Sarah Johnson', 'sarah@builderpartners.com', 'inquiries@builderpartners.com', 'builder-partners', 'active')
ON CONFLICT DO NOTHING;
