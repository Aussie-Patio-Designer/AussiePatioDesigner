-- Drop existing table if it has issues
DROP TABLE IF EXISTS agents CASCADE;

-- Create agents table with proper structure
CREATE TABLE agents (
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

-- Create indexes for better performance
CREATE INDEX idx_agents_email ON agents(email);
CREATE INDEX idx_agents_url_slug ON agents(url_slug);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_created_at ON agents(created_at);

-- Insert test agents to verify everything works
INSERT INTO agents (company_name, contact_name, email, phone, website, url_slug, subscription_type) VALUES
('Melbourne Patio Solutions', 'Sarah Johnson', 'sarah@melbournepatios.com.au', '+61 3 9876 5432', 'https://melbournepatios.com.au', 'melbourne-patio-solutions', 'premium'),
('Sydney Outdoor Designs', 'Mike Chen', 'mike@sydneyoutdoor.com.au', '+61 2 8765 4321', 'https://sydneyoutdoor.com.au', 'sydney-outdoor-designs', 'basic'),
('Brisbane Gazebo Co', 'Emma Wilson', 'emma@brisbangazebo.com.au', '+61 7 7654 3210', 'https://brisbanegazebo.com.au', 'brisbane-gazebo-co', 'enterprise');

-- Verify the setup
SELECT 'Agents system initialized successfully!' as message;
SELECT COUNT(*) as total_agents FROM agents;
SELECT company_name, email, url_slug, subscription_type FROM agents ORDER BY created_at;
