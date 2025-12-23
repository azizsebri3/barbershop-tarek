-- Script SQL pour créer les tables Supabase
-- Exécutez ce script dans le SQL Editor de Supabase

-- Table des réservations
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des services
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- en minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des horaires d'ouverture
CREATE TABLE IF NOT EXISTS opening_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=dimanche, 6=samedi
  day_name TEXT NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(day_of_week)
);

-- Table des paramètres généraux
CREATE TABLE IF NOT EXISTS general_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_name TEXT NOT NULL DEFAULT 'Style & Coupe',
  description TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des images
CREATE TABLE IF NOT EXISTS site_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('hero', 'logo', 'portfolio', 'testimonial')),
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;

-- Politiques pour les réservations (public peut créer, admin peut tout faire)
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view own bookings" ON bookings FOR SELECT USING (auth.uid()::text = id::text OR auth.role() = 'admin');
CREATE POLICY "Admin can manage all bookings" ON bookings FOR ALL USING (auth.role() = 'admin');

-- Politiques pour les services (lecture publique, admin peut modifier)
CREATE POLICY "Public can view services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage services" ON services FOR ALL USING (auth.role() = 'admin');

-- Politiques pour les horaires (lecture publique, admin peut modifier)
CREATE POLICY "Public can view hours" ON opening_hours FOR SELECT USING (true);
CREATE POLICY "Admin can manage hours" ON opening_hours FOR ALL USING (auth.role() = 'admin');

-- Politiques pour les paramètres (lecture publique, admin peut modifier)
CREATE POLICY "Public can view settings" ON general_settings FOR SELECT USING (true);
CREATE POLICY "Admin can manage settings" ON general_settings FOR ALL USING (auth.role() = 'admin');

-- Politiques pour les images (lecture publique, admin peut modifier)
CREATE POLICY "Public can view images" ON site_images FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage images" ON site_images FOR ALL USING (auth.role() = 'admin');

-- Insérer des données par défaut
INSERT INTO services (name, description, price, duration) VALUES
('Coupe Homme', 'Coupe de cheveux moderne pour homme', 25.00, 30),
('Barbe + Coupe', 'Rasage traditionnel + coupe de cheveux', 35.00, 45),
('Barbe seulement', 'Rasage et soin de barbe traditionnel', 20.00, 25)
ON CONFLICT DO NOTHING;

INSERT INTO opening_hours (day_of_week, day_name, open_time, close_time, is_closed) VALUES
(1, 'Lundi', '09:00', '18:00', false),
(2, 'Mardi', '09:00', '18:00', false),
(3, 'Mercredi', '09:00', '18:00', false),
(4, 'Jeudi', '09:00', '18:00', false),
(5, 'Vendredi', '09:00', '18:00', false),
(6, 'Samedi', '08:00', '16:00', false),
(0, 'Dimanche', NULL, NULL, true)
ON CONFLICT (day_of_week) DO NOTHING;

INSERT INTO general_settings (salon_name, description, phone, email, address) VALUES
('Style & Coupe', 'Votre salon de coiffure et barbershop en Belgique. Coupes modernes, colorations tendance et rasage traditionnel premium.', '+32 2 123 45 67', 'contact@stylecoupe.be', 'Belgique')
ON CONFLICT DO NOTHING;

-- Créer un trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opening_hours_updated_at BEFORE UPDATE ON opening_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_general_settings_updated_at BEFORE UPDATE ON general_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();