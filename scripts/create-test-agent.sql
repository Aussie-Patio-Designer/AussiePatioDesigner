-- Create a test agent for Lockyer Sheds
INSERT INTO agents (
  company_name,
  contact_name,
  email,
  phone,
  website_url,
  url_slug,
  status
) VALUES (
  'Lockyer Sheds',
  'John Smith',
  'john@lockyersheds.com.au',
  '+61 7 1234 5678',
  'https://lockyersheds.com.au',
  'lockyersheds',
  'active'
) ON CONFLICT (url_slug) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  website_url = EXCLUDED.website_url,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the agent was created
SELECT id, company_name, email, url_slug, status FROM agents WHERE url_slug = 'lockyersheds';
