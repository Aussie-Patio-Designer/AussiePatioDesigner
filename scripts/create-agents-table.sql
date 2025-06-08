-- Create agents table for partner management
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
    subscription_type VARCHAR(20) DEFAULT 'basic',
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_url_slug ON agents(url_slug);
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Insert a test agent to verify the table works
INSERT INTO agents (
    company_name, 
    contact_name, 
    email, 
    phone, 
    website, 
    url_slug, 
    subscription_type
) VALUES (
    'Test Patio Company',
    'John Test',
    'test@example.com',
    '+61 400 000 000',
    'https://testpatios.com',
    'test-patio-company',
    'basic'
) ON CONFLICT (email) DO NOTHING;

-- Verify the table was created successfully
SELECT 'Agents table created successfully' as message;
SELECT COUNT(*) as total_agents FROM agents;
