-- Script SQL corrigé pour créer la table admin_users
-- Utilise DROP IF EXISTS pour éviter les erreurs si la table/index existe déjà

-- Supprimer l'index s'il existe
DROP INDEX IF EXISTS idx_admin_users_username;
DROP INDEX IF EXISTS idx_admin_users_email;

-- Supprimer la table si elle existe
DROP TABLE IF EXISTS admin_users;

-- Créer la table admin_users
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin', -- 'super_admin' ou 'admin'
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'invited'
    invitation_token VARCHAR(255) UNIQUE,
    invitation_expires_at TIMESTAMPTZ,
    invited_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer des index pour améliorer les performances
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Activer Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (car on utilise service_role)
CREATE POLICY "Allow all operations for service role" ON admin_users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insérer le premier utilisateur (Tarek - super_admin)
-- Mot de passe: admin123
INSERT INTO admin_users (username, email, password_hash, role, status)
VALUES (
    'tarek',
    'tarek@elite-services.com',
    '$2b$10$7oSmVc9WzjWbjpEmahb9j.htDjJ99gj9TnQMSuKv9TnbSEQKKL/Hm',
    'super_admin',
    'active'
);

-- Note: La contrainte de clé étrangère sur invited_by n'est pas nécessaire
-- pour le fonctionnement du système. On la laisse comme simple UUID.

-- Afficher un message de confirmation
SELECT 'Table admin_users créée avec succès!' AS message;
SELECT 'Premier utilisateur créé: tarek / admin123' AS credentials;
