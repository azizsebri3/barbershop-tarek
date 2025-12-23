-- Script de diagnostic pour vérifier la configuration Supabase

-- 1. Vérifier si la table settings existe
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'settings';

-- 2. Vérifier les politiques RLS pour settings
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'settings';

-- 3. Vérifier les politiques RLS pour bookings
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'bookings';

-- 4. Vérifier le contenu de la table settings
SELECT * FROM settings;

-- 5. Tester une insertion dans settings (remplacer par vos vraies valeurs)
-- INSERT INTO settings (key, value) VALUES ('test', '{"test": "value"}'::jsonb);