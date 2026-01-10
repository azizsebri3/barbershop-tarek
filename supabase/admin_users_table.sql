-- Table pour les utilisateurs admin
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin', -- 'super_admin' ou 'admin'
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'pending', 'suspended'
  invited_by UUID REFERENCES admin_users(id),
  invitation_token TEXT,
  invitation_expires_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_invitation_token ON admin_users(invitation_token);

-- Trigger pour updated_at
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

-- RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Service role a accès complet
CREATE POLICY "Service role has full access to admin_users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Créer le premier utilisateur admin (Tarek)
-- Mot de passe: admin123 (hash bcrypt)
-- IMPORTANT: Changez ce mot de passe après la première connexion !
INSERT INTO admin_users (username, email, password_hash, role, status)
VALUES (
  'tarek',
  'tarek@tareksalon.be',
  '$2a$10$8K1p/a0dL3.I7cXR3UuJauEI.QvCVj7aXQPKVxLrVSqXdp7YFG8wi', -- admin123
  'super_admin',
  'active'
) ON CONFLICT (username) DO NOTHING;
