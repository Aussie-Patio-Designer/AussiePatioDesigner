-- Add phone number and additional details columns to gazebo_inquiries table
ALTER TABLE gazebo_inquiries 
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS additional_details TEXT;

-- Create index for phone number for faster searches
CREATE INDEX IF NOT EXISTS idx_gazebo_inquiries_phone ON gazebo_inquiries(customer_phone);

-- Update any existing records to have empty phone numbers (optional)
UPDATE gazebo_inquiries 
SET customer_phone = '' 
WHERE customer_phone IS NULL;
