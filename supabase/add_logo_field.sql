-- Add logo_url field to settings table for dynamic logo management
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '/logo.png';

-- Update existing record with default logo
UPDATE settings 
SET logo_url = '/logo.png' 
WHERE logo_url IS NULL;
