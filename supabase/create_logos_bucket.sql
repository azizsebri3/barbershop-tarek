-- Create logos bucket in Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to logos bucket
CREATE POLICY "Public Access to Logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (bucket_id = 'logos');

-- Allow authenticated users to update logos
CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
TO authenticated, anon
USING (bucket_id = 'logos');

-- Allow authenticated users to delete logos
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
TO authenticated, anon
USING (bucket_id = 'logos');
