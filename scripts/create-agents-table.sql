-- Create agents table for managing patio builders/designers/suppliers
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  website VARCHAR(255),
  logo_url TEXT,
  url_slug VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  subscription_type VARCHAR(50) DEFAULT 'basic',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_url_slug ON agents(url_slug);
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Add agent_id to gazebo_inquiries table to track which agent received the inquiry
ALTER TABLE gazebo_inquiries 
ADD COLUMN IF NOT EXISTS agent_id INTEGER REFERENCES agents(id),
ADD COLUMN IF NOT EXISTS agent_url_slug VARCHAR(100);

-- Create index for agent inquiries
CREATE INDEX IF NOT EXISTS idx_gazebo_inquiries_agent_id ON gazebo_inquiries(agent_id);
