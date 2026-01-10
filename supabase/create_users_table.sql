-- Créer la table users pour la gestion des personnels
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique pour que seuls les admins puissent gérer les utilisateurs
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt()->>'role' = 'admin');