-- Script SQL pour créer la table des subscriptions push
-- À exécuter dans Supabase SQL Editor

-- Table pour stocker les subscriptions push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide par endpoint
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS désactivé pour cette table (accès via service role uniquement)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (via service role)
CREATE POLICY "Service role full access" ON push_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Commentaire
COMMENT ON TABLE push_subscriptions IS 'Stockage des subscriptions pour les notifications push PWA';
