-- Ajouter les champs pour la réinitialisation du mot de passe

-- Ajouter reset_token (token unique pour la réinitialisation)
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) UNIQUE;

-- Ajouter reset_token_expires_at (expiration du token)
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_admin_users_reset_token ON admin_users(reset_token);

-- Afficher un message de confirmation
SELECT 'Champs reset_token ajoutés avec succès!' AS message;
