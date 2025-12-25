# 🎯 Démarrage Rapide - Testimonials & TikTok

## ⚡ Installation Express (5 minutes)

### 1️⃣ Base de Données Supabase

Connectez-vous à [supabase.com](https://supabase.com) et exécutez ce SQL :

\`\`\`sql
-- Copier/coller dans SQL Editor de Supabase
-- (voir le fichier complet dans supabase/testimonials_setup.sql)

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

-- Ajouter TikTok
ALTER TABLE settings ADD COLUMN IF NOT EXISTS tiktok TEXT DEFAULT '';

-- Activer RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Politique : tout le monde peut soumettre
CREATE POLICY "Anyone can submit testimonials"
  ON testimonials FOR INSERT WITH CHECK (true);

-- Politique : seuls les avis approuvés sont publics
CREATE POLICY "Approved testimonials are public"
  ON testimonials FOR SELECT USING (is_approved = true);
\`\`\`

### 2️⃣ Redémarrer le Serveur

\`\`\`bash
npm run dev
\`\`\`

### 3️⃣ Tester !

1. **Frontend** : Allez sur [http://localhost:3000](http://localhost:3000)
   - Descendez à la section Témoignages
   - Cliquez sur le bouton flottant doré "Laissez votre avis"
   - Soumettez un avis de test

2. **Admin** : Allez sur [http://localhost:3000/admin](http://localhost:3000/admin)
   - Connectez-vous
   - Cliquez sur l'onglet "Avis Clients" ⭐
   - Approuvez votre avis de test
   - Ajoutez votre lien TikTok dans "Paramètres Généraux"

---

## 🎨 Ce Qui a Changé

### ✅ Hero Section
- ❌ **AVANT** : Stats statiques (800+, 3000+, 15+)
- ✅ **APRÈS** : Design épuré, focus sur CTAs

### ✅ Testimonials
- ❌ **AVANT** : 4 avis fictifs statiques
- ✅ **APRÈS** : Avis réels dynamiques + formulaire de soumission

### ✅ Footer
- ❌ **AVANT** : Seulement Instagram et Facebook
- ✅ **APRÈS** : + TikTok avec lien dynamique

### ✅ Admin Panel
- ✅ **NOUVEAU** : Onglet "Avis Clients"
- ✅ **NOUVEAU** : Champ TikTok dans Paramètres Généraux

---

## 📸 Aperçu Visuel

### Bouton Flottant
\`\`\`
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│                      ┌─────────┐│
│                      │  ⭐     ││
│                      │ Laissez││
│                      │ votre  ││
│                      │  avis  ││
│                      └─────────┘│
└─────────────────────────────────┘
     (Coin inférieur droit)
\`\`\`

### Modal de Soumission
\`\`\`
┌───────────────────────────────┐
│   ⭐ Partagez votre          │
│      expérience               │
├───────────────────────────────┤
│ Nom: ________________         │
│ Email: ______________         │
│ Service: ____________         │
│                               │
│ Note: ⭐⭐⭐⭐⭐             │
│                               │
│ Message:                      │
│ ┌─────────────────────────┐  │
│ │                         │  │
│ └─────────────────────────┘  │
│                               │
│  [Annuler]    [✉️ Envoyer]   │
└───────────────────────────────┘
\`\`\`

### Panel Admin - Avis Clients
\`\`\`
┌────────────────────────────────────────┐
│ Gestion des Avis Clients    [🔄]      │
├────────────────────────────────────────┤
│ [Total: 12] [Approuvés: 8] [Attente: 4]│
│ [Note: 4.8/5]                          │
├────────────────────────────────────────┤
│ [Tous] [Approuvés] [En attente]       │
├────────────────────────────────────────┤
│ 👤 Jean Dupont - ⭐⭐⭐⭐⭐          │
│    jean@email.com                      │
│    "Excellent service !"               │
│    Service: Coupe homme                │
│    [✅ Approuver] [🗑️ Supprimer]      │
└────────────────────────────────────────┘
\`\`\`

---

## 🎯 Cas d'Usage

### Client Visite le Site
1. Scroll → Section Témoignages
2. Voit le bouton flottant pulsant
3. Clique dessus
4. Remplit le formulaire
5. Envoie → "Merci ! Votre avis sera publié après validation"

### Admin Gère les Avis
1. Login au panel admin
2. Notification badge sur "Avis Clients"
3. Voit 4 nouveaux avis en attente
4. Lit et approuve les bons avis
5. Supprime les spams
6. Stats mises à jour automatiquement

---

## 💡 Astuces Pro

### Pour Plus d'Avis
- Ajoutez un QR code dans votre salon pointant vers le site
- Envoyez un email après chaque rendez-vous
- Offrez une petite réduction pour chaque avis laissé

### Modération
- Approuvez rapidement (< 24h)
- Répondez aux avis négatifs (ajoutez cette feature !)
- Mettez en avant les 5 étoiles

### TikTok
- Créez du contenu salon (transformations, ambiance)
- Partagez sur tous vos réseaux
- Ajoutez des CTA vers le site

---

## 🔥 Features à Venir (Suggestions)

- [ ] Réponses de l'admin aux avis
- [ ] Photos dans les avis
- [ ] Partage d'avis sur les réseaux sociaux
- [ ] Widget d'avis pour autres sites
- [ ] Email automatique de confirmation
- [ ] Statistiques avancées (tendances, etc.)

---

## ✅ Checklist de Lancement

- [ ] Script SQL exécuté dans Supabase
- [ ] Au moins 3 avis approuvés pour commencer
- [ ] Lien TikTok ajouté
- [ ] Testé le formulaire
- [ ] Testé l'approbation admin
- [ ] Vérifié sur mobile
- [ ] Partagé avec l'équipe

---

**🚀 C'est parti ! Votre site est maintenant prêt pour collecter de vrais avis clients !**
