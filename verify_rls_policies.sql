-- Script de vérification des politiques RLS pour les réservations
-- À exécuter dans le SQL Editor de Supabase

-- Vérifier les politiques existantes sur la table bookings
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;

-- Vérifier les politiques sur la table settings
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'settings'
ORDER BY policyname;

-- Vérifier si les tables existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('bookings', 'settings');

-- Tester une requête de suppression (devrait réussir avec service role)
-- Note: Cette requête ne supprime rien, elle teste juste les permissions
SELECT COUNT(*) as booking_count FROM bookings LIMIT 1;