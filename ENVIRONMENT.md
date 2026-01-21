# 📋 Configuration des Variables d'Environnement

Ce fichier explique comment configurer toutes les variables nécessaires pour faire fonctionner le projet.

## 📌 Variables Requises

Votre fichier `.env.local` doit contenir ces variables :

```env
# Supabase Configuration (REQUIS)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL de Base (REQUIS EN PRODUCTION)
# Important: définir en production pour les emails de réinitialisation
NEXT_PUBLIC_BASE_URL=https://votre-domaine.com

# Email Configuration (OPTIONNEL)
SMTP_HOST=smtp.votre-domaine.com
SMTP_PORT=587
SMTP_USER=votre-email@example.com
SMTP_PASSWORD=votre-mot-de-passe
EMAIL_FROM=noreply@example.com
```

## 🔑 Où Trouver les Clés Supabase

### 1. Project URL
- Allez sur https://supabase.com/dashboard
- Ouvrez votre projet
- Cliquez "Settings" (engrenage en bas à gauche)
- Allez dans "API"
- Copiez **Project URL**

### 2. Anon Public Key
- Même endroit que Project URL
- Copiez **anon public** (c'est NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Service Role Secret
- Même endroit
- Copiez **service_role secret** (gardez-le secret!)

## ✨ Variables Publiques vs Privées

### Variables Publiques (`NEXT_PUBLIC_`)
- Visibles côté client (navigateur)
- Peuvent être exposées (c'est normal)
- Utilisez les clés "anon" de Supabase

**Exemples:**
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Variables Privées
- Seulement côté serveur
- Ne pas exposer au client
- Utilisez les clés "service_role" ou secrets sensibles

**Exemples:**
```env
SUPABASE_SERVICE_ROLE_KEY=...
SMTP_PASSWORD=...
```

## 📧 Configuration Email (Optionnel)

Si vous voulez envoyer des confirmations par email, configurez l'une de ces options :

### Option 1: Resend (Recommandé pour commencer)

```bash
npm install resend
```

Configuration :
```env
RESEND_API_KEY=re_votre_cle_api
```

Utilisation dans `src/app/api/bookings/route.ts` :
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@example.com',
  to: email,
  subject: 'Confirmation de réservation',
  html: '<h1>Merci!</h1>'
});
```

### Option 2: SendGrid

```bash
npm install @sendgrid/mail
```

Configuration :
```env
SENDGRID_API_KEY=SG.votre_cle_api
```

### Option 3: Nodemailer (Gmail)

```bash
npm install nodemailer
```

Configuration :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app
EMAIL_FROM=votre-email@gmail.com
```

## 🛡️ Sécurité

### ⚠️ NE PAS faire :
```
❌ Pas de clés dans git
❌ Pas de secrets dans le code
❌ Pas de partage de .env.local
```

### ✅ À faire :
```
✅ Ajouter .env.local au .gitignore (déjà fait)
✅ Utiliser .env.local.example comme template
✅ Copier .env.local.example en .env.local et remplir
✅ Changer les secrets régulièrement
```

## 📝 Fichier .env.local.example

Vous trouverez un fichier `.env.local.example` à la racine du projet.
Pour l'utiliser :

```bash
# Copier le fichier
cp .env.local.example .env.local

# Ou sur Windows
copy .env.local.example .env.local

# Puis éditez .env.local avec vos vraies clés
```

## 🚀 Déploiement

Quand vous déployez sur Vercel, Netlify, etc., vous devez aussi configurer les variables d'environnement là-bas.

### Vercel
1. Allez dans Project Settings
2. Allez dans "Environment Variables"
3. Ajoutez chaque variable
4. Cliquez "Save" et "Redeploy"

### Netlify
1. Allez dans Site Settings
2. Allez dans "Build & Deploy" > "Environment"
3. Cliquez "Edit variables"
4. Ajoutez vos variables
5. Déclenchez un nouveau deploy

## ✅ Vérifier que Tout Fonctionne

```bash
# Démarrer le serveur
npm run dev

# Aller à http://localhost:3000/booking
# Remplir et soumettre le formulaire
# Vérifier que les données apparaissent dans Supabase
```

Si vous voyez des erreurs :
- Vérifiez que `.env.local` existe
- Vérifiez que les clés Supabase sont correctes
- Redémarrez le serveur (Ctrl+C puis npm run dev)

---

**Besoin d'aide ?** Consultez la [documentation Supabase](https://supabase.com/docs) !
