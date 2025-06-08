-- First check if the agents table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agents'
    ) THEN
        -- Create the agents table if it doesn't exist
        CREATE TABLE agents (
            id SERIAL PRIMARY KEY,
            company_name VARCHAR(255) NOT NULL,
            contact_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone VARCHAR(50),
            website_url VARCHAR(255),
            logo_url VARCHAR(255),
            url_slug VARCHAR(255) NOT NULL UNIQUE,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        RAISE NOTICE 'Created agents table';
    ELSE
        RAISE NOTICE 'Agents table already exists';
    END IF;
END
$$;

-- Make sure the url_slug column exists and is unique
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agents'
        AND column_name = 'url_slug'
    ) THEN
        ALTER TABLE agents ADD COLUMN url_slug VARCHAR(255);
        ALTER TABLE agents ADD CONSTRAINT agents_url_slug_unique UNIQUE (url_slug);
        RAISE NOTICE 'Added url_slug column';
    ELSE
        RAISE NOTICE 'url_slug column already exists';
    END IF;
END
$$;

-- Make sure the status column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'agents'
        AND column_name = 'status'
    ) THEN
        ALTER TABLE agents ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        RAISE NOTICE 'Added status column';
    ELSE
        RAISE NOTICE 'status column already exists';
    END IF;
END
$$;

-- Check if we have a lockyersheds agent
DO $$
DECLARE
    agent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO agent_count FROM agents WHERE url_slug = 'lockyersheds';
    
    IF agent_count = 0 THEN
        -- Insert the lockyersheds agent if it doesn't exist
        INSERT INTO agents (
            company_name, contact_name, email, phone, 
            website_url, url_slug, status
        ) VALUES (
            'Lockyer Sheds', 'Sales Team', 'sales@lockyersheds.com.au', '0412345678',
            'https://lockyersheds.com.au', 'lockyersheds', 'active'
        );
        RAISE NOTICE 'Created lockyersheds agent';
    ELSE
        -- Make sure the lockyersheds agent is active
        UPDATE agents SET status = 'active' WHERE url_slug = 'lockyersheds';
        RAISE NOTICE 'lockyersheds agent already exists, set to active';
    END IF;
END
$$;

-- Show all agents
SELECT id, company_name, email, url_slug, status, created_at FROM agents;
