-- Create agents table if it doesn't exist
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

-- Insert a test record to verify the table works
INSERT INTO agents (
    company_name, 
    contact_name, 
    email, 
    phone, 
    website, 
    url_slug, 
    subscription_type
) VALUES (
    'Test Agent Company', 
    'Test Contact', 
    'test-sql-script@example.com', 
    '+61 400 123 456', 
    'https://example.com', 
    'test-sql-script', 
    'basic'
) ON CONFLICT (email) DO NOTHING;

-- Verify the table exists and has the correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'agents'
ORDER BY 
    ordinal_position;

-- Count existing records
SELECT COUNT(*) FROM agents;
