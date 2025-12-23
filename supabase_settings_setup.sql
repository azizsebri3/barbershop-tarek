-- Script pour créer la table settings et les politiques RLS
-- À exécuter dans le SQL Editor de Supabase

-- Créer la table settings si elle n'existe pas
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur la table settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques settings si elles existent
DROP POLICY IF EXISTS "Allow authenticated users to read settings" ON settings;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON settings;

-- Politique pour permettre aux utilisateurs authentifiés de lire tous les paramètres
CREATE POLICY "Allow authenticated users to read settings" ON settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de modifier les paramètres
CREATE POLICY "Allow authenticated users to update settings" ON settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Insérer des services par défaut si la table est vide
INSERT INTO settings (key, value)
VALUES ('services', '[
  {
    "id": "coupe-homme",
    "name": "Coupe Homme",
    "description": "Coupe classique ou moderne avec finition impeccable",
    "price": 25,
    "duration": 30
  },
  {
    "id": "barbe-coupe",
    "name": "Barbe + Coupe",
    "description": "Entretien complet de la barbe combiné avec une coupe de cheveux",
    "price": 40,
    "duration": 60
  },
  {
    "id": "barbe-seulement",
    "name": "Barbe",
    "description": "Rasage traditionnel et taille de barbe premium",
    "price": 20,
    "duration": 30
  }
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Mettre à jour les politiques RLS pour la table bookings
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
DROP POLICY IF EXISTS "Public can view bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can delete bookings" ON bookings;

-- Créer de nouvelles politiques pour les réservations
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view bookings" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update bookings" ON bookings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete bookings" ON bookings
  FOR DELETE USING (auth.role() = 'authenticated');

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);