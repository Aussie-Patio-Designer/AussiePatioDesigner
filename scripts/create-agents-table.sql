-- Create agents table for managing patio builder partners
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(255),
    logo_url TEXT,
    url_slug VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    subscription_type VARCHAR(20) DEFAULT 'basic' CHECK (subscription_type IN ('basic', 'premium', 'enterprise')),
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_url_slug ON agents(url_slug);
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Add sample data for testing
INSERT INTO agents (company_name, contact_name, email, phone, website, url_slug, subscription_type) 
VALUES 
    ('ABC Patio Builders', 'John Smith', 'john@abcpatios.com', '+61 400 123 456', 'https://abcpatios.com', 'abc-patio-builders', 'premium'),
    ('Sunshine Gazebos', 'Sarah Johnson', 'sarah@sunshinegazebos.com.au', '+61 400 789 012', 'https://sunshinegazebos.com.au', 'sunshine-gazebos', 'basic')
ON CONFLICT (email) DO NOTHING;
