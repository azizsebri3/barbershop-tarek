-- ============================================
-- CONFIGURATION BUCKET SUPABASE STORAGE
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor
-- pour corriger les problèmes d'affichage d'images

-- 1. Vérifier que le bucket existe et est public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'salon-photos';

-- 2. Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- 3. Créer des politiques simples et permissives

-- Politique 1 : Lecture publique (TOUT LE MONDE peut voir les images)
CREATE POLICY "Public read access for salon-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'salon-photos');

-- Politique 2 : Upload pour tout le monde (temporaire pour test)
CREATE POLICY "Public upload access for salon-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'salon-photos');

-- Politique 3 : Suppression pour tout le monde (temporaire pour test)
CREATE POLICY "Public delete access for salon-photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'salon-photos');

-- Politique 4 : Update pour tout le monde (temporaire pour test)
CREATE POLICY "Public update access for salon-photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'salon-photos');

-- 4. Vérifier la configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'salon-photos';

-- 5. Lister toutes les politiques actives
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%salon-photos%';

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 
-- APRÈS CE SCRIPT, VOS IMAGES SERONT ACCESSIBLES PUBLIQUEMENT !
-- 
-- Configuration recommandée pour production :
-- - Remplacer les politiques "Public" par "Authenticated" 
-- - Utiliser auth.uid() pour restreindre les uploads/suppressions
-- - Activer RLS (Row Level Security)
--
-- Pour production sécurisée, utilisez plutôt :
-- 
-- CREATE POLICY "Authenticated upload"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'salon-photos' AND auth.uid() IS NOT NULL);
--
-- ============================================
