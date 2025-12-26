-- Drop existing policies
DROP POLICY IF EXISTS "Public Access to Logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete logos" ON storage.objects;

-- Create permissive policies for logos bucket
CREATE POLICY "Anyone can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Anyone can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Anyone can update logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'logos');

CREATE POLICY "Anyone can delete logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'logos');
