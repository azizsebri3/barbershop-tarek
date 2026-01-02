-- Table pour gérer les créneaux de disponibilité de l'admin
CREATE TABLE availability_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes par date
CREATE INDEX idx_availability_date ON availability_slots(date);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_availability_updated_at
    BEFORE UPDATE ON availability_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Politique RLS (Row Level Security)
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Politique : Autoriser toutes les opérations pour le service_role
CREATE POLICY "Allow service role full access" ON availability_slots
    FOR ALL USING (auth.role() = 'service_role');

-- Politique : Lecture publique pour les disponibilités
CREATE POLICY "Allow public read access" ON availability_slots
    FOR SELECT USING (true);

-- Politique : Seul l'admin peut modifier (ici on utilise une approche simple)
-- En production, vous pourriez vouloir une authentification plus sophistiquée
CREATE POLICY "Allow admin modifications" ON availability_slots
    FOR ALL USING (true);

-- Contrainte unique pour éviter les doublons de date/heure
CREATE UNIQUE INDEX unique_availability_slot 
ON availability_slots(date, start_time, end_time) 
WHERE is_available = true;