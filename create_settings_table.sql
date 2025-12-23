-- Créer la table settings
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true);

-- Politique pour permettre les mises à jour authentifiées (admin)
CREATE POLICY "Allow authenticated update settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- Insérer les paramètres par défaut
INSERT INTO settings (key, value) VALUES
('general', '{
  "salonName": "Style & Coupe",
  "description": "Votre salon de coiffure et barbershop en Belgique. Coupes modernes, colorations tendance et rasage traditionnel premium.",
  "phone": "+32 2 123 45 67",
  "email": "contact@stylecoupe.be",
  "address": "Belgique",
  "facebook": "",
  "instagram": ""
}'::jsonb)
ON CONFLICT (key) DO NOTHING;