-- ==========================================
-- SCRIPT COMPLET DE CONFIGURATION BASE DE DONNÉES
-- Pour un nouveau projet Supabase
-- ==========================================

-- ==========================================
-- 1. TABLE BOOKINGS (PRINCIPALE)
-- ==========================================

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  service VARCHAR(100) NOT NULL,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS bookings_email_idx ON bookings(email);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings(date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Politiques
CREATE POLICY "Allow public insert" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Allow public update" ON bookings
  FOR UPDATE USING (true);

-- ==========================================
-- 2. TABLE SETTINGS
-- ==========================================

CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS settings_key_idx ON settings(key);

-- Trigger
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Politique service role
CREATE POLICY "Service role full access to settings"
  ON settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insérer settings par défaut
INSERT INTO settings (key, value, logo_url)
VALUES ('general', '{
  "salonName": "Style & Coupe",
  "description": "Votre salon de coiffure et barbershop en Belgique. Coupes modernes, colorations tendance et rasage traditionnel premium.",
  "phone": "+32465632205",
  "email": "contact@tareksalon.be",
  "address": "Belgique",
  "website": "tareksalon.be",
  "facebook": "",
  "instagram": "",
  "tiktok": ""
}', '/logo.png')
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- 3. TABLE TESTIMONIALS
-- ==========================================

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  service VARCHAR(100),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_testimonials_approved
  ON testimonials(is_approved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_testimonials_created
  ON testimonials(created_at DESC);

-- RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Politiques
CREATE POLICY "Anyone can submit testimonials"
  ON testimonials
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Approved testimonials are public"
  ON testimonials
  FOR SELECT
  USING (is_approved = true);

-- Trigger
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_testimonials_updated_at();

-- Données de test
INSERT INTO testimonials (name, email, rating, message, service, is_approved)
VALUES
  ('Jean Dupont', 'jean.dupont@example.com', 5, 'Service exceptionnel ! L''équipe est très professionnelle et le résultat est toujours impeccable. Je recommande vivement ce salon.', 'Coupe homme', true),
  ('Marie Bernard', 'marie.bernard@example.com', 5, 'Meilleur salon de Namur ! Ambiance chaleureuse et coiffeurs talentueux. Ma coloration est parfaite.', 'Dégradé', true),
  ('Thomas Martin', 'thomas.martin@example.com', 5, 'Je reviens toujours avec plaisir. La qualité du service est constante et l''accueil formidable.', 'Coupe + Barbe', true),
  ('Sophie Lefevre', 'sophie.lefevre@example.com', 4, 'Très bon salon avec des produits de qualité. Coiffeurs expérimentés et accueil sympathique.', 'Coupe homme', true)
ON CONFLICT DO NOTHING;

-- ==========================================
-- 4. TABLE ADMIN_USERS
-- ==========================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  invited_by UUID REFERENCES admin_users(id),
  invitation_token TEXT,
  invitation_expires_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_invitation_token ON admin_users(invitation_token);

-- Trigger
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_users_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION update_admin_users_updated_at();

-- RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Politique
CREATE POLICY "Service role has full access to admin_users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin par défaut (mot de passe: admin123)
INSERT INTO admin_users (username, email, password_hash, role, status)
VALUES (
  'tarek',
  'tarek@tareksalon.be',
  '$2a$10$8K1p/a0dL3.I7cXR3UuJauEI.QvCVj7aXQPKVxLrVSqXdp7YFG8wi',
  'super_admin',
  'active'
) ON CONFLICT (username) DO NOTHING;

-- ==========================================
-- 5. TABLE AVAILABILITY_SLOTS
-- ==========================================

CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability_slots(date);

-- Trigger
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

-- RLS
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Politiques
CREATE POLICY "Allow service role full access" ON availability_slots
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow public read access" ON availability_slots
    FOR SELECT USING (true);

-- ==========================================
-- 6. TABLE USERS (PERSONNEL)
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt()->>'role' = 'admin');

-- ==========================================
-- 7. TABLE PUSH_SUBSCRIPTIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique
CREATE POLICY "Service role full access" ON push_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- VÉRIFICATIONS FINALES
-- ==========================================

-- Compter les tables créées
SELECT
  'bookings' as table_name, COUNT(*) as count FROM bookings
UNION ALL
SELECT 'settings', COUNT(*) FROM settings
UNION ALL
SELECT 'testimonials', COUNT(*) FROM testimonials
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users
UNION ALL
SELECT 'availability_slots', COUNT(*) FROM availability_slots
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'push_subscriptions', COUNT(*) FROM push_subscriptions;

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;