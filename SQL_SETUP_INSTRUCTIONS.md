# 🗄️ Instructions SQL - Configuration Base de Données

## ⚡ Script d'Installation Complet

Copiez et exécutez ce script dans votre **SQL Editor Supabase** :

\`\`\`sql
-- ==========================================
-- 1. CRÉATION DE LA TABLE TESTIMONIALS
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

-- ==========================================
-- 2. INDEX POUR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_testimonials_approved 
  ON testimonials(is_approved, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_testimonials_created 
  ON testimonials(created_at DESC);

-- ==========================================
-- 3. ACTIVATION ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. POLITIQUES RLS
-- ==========================================

-- Politique : N'importe qui peut soumettre un avis
CREATE POLICY "Anyone can submit testimonials"
  ON testimonials
  FOR INSERT
  WITH CHECK (true);

-- Politique : Seuls les avis approuvés sont visibles publiquement
CREATE POLICY "Approved testimonials are public"
  ON testimonials
  FOR SELECT
  USING (is_approved = true);

-- ==========================================
-- 5. AJOUT CHAMP TIKTOK DANS SETTINGS
-- ==========================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'settings' 
    AND column_name = 'tiktok'
  ) THEN
    ALTER TABLE settings ADD COLUMN tiktok TEXT DEFAULT '';
  END IF;
END $$;

-- ==========================================
-- 6. TRIGGER POUR UPDATED_AT
-- ==========================================

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

-- ==========================================
-- 7. DONNÉES DE TEST (OPTIONNEL)
-- ==========================================

INSERT INTO testimonials (name, email, rating, message, service, is_approved) 
VALUES
  (
    'Jean Dupont', 
    'jean.dupont@example.com', 
    5, 
    'Service exceptionnel ! L''équipe est très professionnelle et le résultat est toujours impeccable. Je recommande vivement ce salon.', 
    'Coupe homme', 
    true
  ),
  (
    'Marie Bernard', 
    'marie.bernard@example.com', 
    5, 
    'Meilleur salon de Namur ! Ambiance chaleureuse et coiffeurs talentueux. Ma coloration est parfaite.', 
    'Dégradé', 
    true
  ),
  (
    'Thomas Martin', 
    'thomas.martin@example.com', 
    5, 
    'Je reviens toujours avec plaisir. La qualité du service est constante et l''accueil formidable.', 
    'Coupe + Barbe', 
    true
  ),
  (
    'Sophie Lefevre', 
    'sophie.lefevre@example.com', 
    4, 
    'Très bon salon avec des produits de qualité. Coiffeurs expérimentés et accueil sympathique.', 
    'Coupe homme', 
    true
  );

-- ==========================================
-- ✅ INSTALLATION TERMINÉE !
-- ==========================================

-- Vérification : Comptez les testimonials
SELECT COUNT(*) as total_testimonials FROM testimonials;

-- Vérification : Affichez les avis approuvés
SELECT id, name, rating, service, created_at 
FROM testimonials 
WHERE is_approved = true 
ORDER BY created_at DESC;

-- Vérification : Vérifiez que le champ tiktok existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'settings' 
AND column_name = 'tiktok';
\`\`\`

---

## 📝 Instructions Détaillées

### 1. Accéder à Supabase SQL Editor

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Dans le menu gauche, cliquez sur **"SQL Editor"**
4. Cliquez sur **"New query"**

### 2. Exécuter le Script

1. **Copiez** tout le script SQL ci-dessus
2. **Collez** dans l'éditeur SQL
3. Cliquez sur **"Run"** (ou Ctrl+Entrée)
4. Attendez le message de succès ✅

### 3. Vérifications

Si tout s'est bien passé, vous devriez voir :

\`\`\`
✅ Table 'testimonials' created
✅ Indexes created
✅ RLS enabled
✅ Policies created
✅ Column 'tiktok' added to settings
✅ Trigger created
✅ 4 test testimonials inserted
\`\`\`

---

## 🔍 Vérifications Post-Installation

### Vérifier la Table Testimonials

\`\`\`sql
-- Voir toutes les colonnes
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'testimonials'
ORDER BY ordinal_position;
\`\`\`

Résultat attendu :
\`\`\`
id          | uuid    | 
name        | varchar | 100
email       | varchar | 255
rating      | integer |
message     | text    |
service     | varchar | 100
is_approved | boolean |
created_at  | timestamp with time zone |
updated_at  | timestamp with time zone |
\`\`\`

### Vérifier les Politiques RLS

\`\`\`sql
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE tablename = 'testimonials';
\`\`\`

Résultat attendu :
\`\`\`
"Anyone can submit testimonials"    | SELECT
"Approved testimonials are public"  | INSERT
\`\`\`

### Vérifier le Champ TikTok

\`\`\`sql
SELECT tiktok FROM settings LIMIT 1;
\`\`\`

Si la requête fonctionne sans erreur → ✅ Le champ existe

### Compter les Avis

\`\`\`sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_approved = true) as approved,
  COUNT(*) FILTER (WHERE is_approved = false) as pending
FROM testimonials;
\`\`\`

Résultat attendu (avec données de test) :
\`\`\`
total: 4
approved: 4
pending: 0
\`\`\`

---

## 🚨 Troubleshooting

### Erreur : "relation testimonials already exists"

**Solution :** La table existe déjà. Vous pouvez :

Option A - Supprimer et recréer :
\`\`\`sql
DROP TABLE IF EXISTS testimonials CASCADE;
-- Puis réexécuter le script principal
\`\`\`

Option B - Conserver la table existante :
\`\`\`sql
-- Vérifiez simplement qu'elle a les bonnes colonnes
SELECT * FROM testimonials LIMIT 1;
\`\`\`

### Erreur : "column tiktok already exists"

**Solution :** Le champ existe déjà, c'est normal ! Continuez.

### Erreur : "policy already exists"

**Solution :** Les politiques existent déjà. Supprimez-les d'abord :

\`\`\`sql
DROP POLICY IF EXISTS "Anyone can submit testimonials" ON testimonials;
DROP POLICY IF EXISTS "Approved testimonials are public" ON testimonials;
-- Puis réexécuter la création des politiques
\`\`\`

### Erreur : "permission denied for table settings"

**Solution :** Vous n'avez pas les droits admin. Vérifiez que :
1. Vous êtes connecté comme propriétaire du projet
2. Vous utilisez le bon projet Supabase

---

## 🧹 Nettoyage (Reset Complet)

Si vous voulez tout recommencer :

\`\`\`sql
-- ⚠️ ATTENTION : Ceci supprime TOUTES les données testimonials !

-- 1. Supprimer les politiques
DROP POLICY IF EXISTS "Anyone can submit testimonials" ON testimonials;
DROP POLICY IF EXISTS "Approved testimonials are public" ON testimonials;

-- 2. Supprimer les triggers
DROP TRIGGER IF EXISTS testimonials_updated_at ON testimonials;

-- 3. Supprimer la fonction
DROP FUNCTION IF EXISTS update_testimonials_updated_at();

-- 4. Supprimer la table
DROP TABLE IF EXISTS testimonials CASCADE;

-- 5. Supprimer le champ tiktok
ALTER TABLE settings DROP COLUMN IF EXISTS tiktok;

-- Maintenant vous pouvez réexécuter le script principal
\`\`\`

---

## 📊 Requêtes Utiles

### Voir tous les avis récents

\`\`\`sql
SELECT 
  name,
  rating,
  LEFT(message, 50) || '...' as message_preview,
  service,
  is_approved,
  created_at
FROM testimonials
ORDER BY created_at DESC
LIMIT 10;
\`\`\`

### Statistiques

\`\`\`sql
SELECT 
  COUNT(*) as total_avis,
  ROUND(AVG(rating), 1) as note_moyenne,
  COUNT(*) FILTER (WHERE is_approved = true) as approuves,
  COUNT(*) FILTER (WHERE is_approved = false) as en_attente,
  COUNT(*) FILTER (WHERE rating >= 4) as satisfaits
FROM testimonials;
\`\`\`

### Approuver tous les avis en attente (Admin)

\`\`\`sql
UPDATE testimonials 
SET is_approved = true 
WHERE is_approved = false;
\`\`\`

### Supprimer les avis anciens (> 2 ans)

\`\`\`sql
DELETE FROM testimonials 
WHERE created_at < NOW() - INTERVAL '2 years';
\`\`\`

---

## 🔐 Sécurité RLS Expliquée

### Politique INSERT (Soumission)

\`\`\`sql
CREATE POLICY "Anyone can submit testimonials"
  ON testimonials
  FOR INSERT
  WITH CHECK (true);
\`\`\`

**Signification :** N'importe qui peut insérer un avis. C'est sécurisé car :
- Les avis ne sont pas visibles par défaut (`is_approved = false`)
- L'admin doit les approuver
- Pas d'accès direct à modifier/supprimer

### Politique SELECT (Lecture)

\`\`\`sql
CREATE POLICY "Approved testimonials are public"
  ON testimonials
  FOR SELECT
  USING (is_approved = true);
\`\`\`

**Signification :** Seuls les avis approuvés sont visibles publiquement.
- Les clients ne voient que les avis validés
- L'admin voit tout (via routes API protégées)
- Protection contre le spam/contenu inapproprié

---

## ✅ Checklist Finale

Avant de continuer, vérifiez que :

- [ ] Le script SQL s'est exécuté sans erreur
- [ ] La table `testimonials` existe
- [ ] Le champ `tiktok` existe dans `settings`
- [ ] Au moins 4 avis de test existent
- [ ] Les politiques RLS sont actives
- [ ] Les vérifications passent (comptage, etc.)

Si tout est ✅, vous êtes prêt ! Passez à l'étape suivante : démarrer l'application.

---

**💡 Conseil :** Gardez ce fichier ouvert pendant le développement pour référence rapide.
