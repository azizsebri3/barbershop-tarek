# Guide d'Installation Complet

## ✅ Prérequis

Avant de commencer, assurez-vous que vous avez :
- **Node.js** v18 ou supérieur (https://nodejs.org/)
- **npm** v9 ou supérieur
- Un compte **Supabase** (gratuit à https://supabase.com)
- Un éditeur de code (VS Code recommandé)

## 📦 Étape 1 : Installation de Node.js

### Windows
1. Allez sur https://nodejs.org/
2. Téléchargez la version LTS (Long Term Support)
3. Lancez l'installateur et suivez les instructions
4. Acceptez les conditions d'utilisation
5. Vérifiez l'installation :
```bash
node --version
npm --version
```

### macOS
```bash
# Avec Homebrew
brew install node

# Ou téléchargez depuis https://nodejs.org/
```

### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nodejs npm

# Fedora
sudo dnf install nodejs npm
```

## 🚀 Étape 2 : Configuration Supabase

### 2.1 Créer un compte
1. Allez sur https://supabase.com
2. Cliquez "Sign Up"
3. Créez un compte avec votre email
4. Vérifiez votre email

### 2.2 Créer un nouveau projet
1. Dans le dashboard Supabase, cliquez "New Project"
2. Donnez un nom à votre projet
3. Créez une password forte
4. Sélectionnez la région (choisissez proche de vous)
5. Cliquez "Create new project" et attendez (5-10 minutes)

### 2.3 Récupérer les clés
1. Une fois le projet créé, allez dans "Settings" > "API"
2. Notez :
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role secret** (SUPABASE_SERVICE_ROLE_KEY)

### 2.4 Créer la table des réservations

1. Allez dans "SQL Editor" (côté gauche)
2. Cliquez "New Query"
3. Copiez-collez ce code SQL :

```sql
-- Créer la table bookings
CREATE TABLE bookings (
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

-- Créer des index pour la performance
CREATE INDEX bookings_email_idx ON bookings(email);
CREATE INDEX bookings_date_idx ON bookings(date);
CREATE INDEX bookings_status_idx ON bookings(status);

-- Activer Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Autoriser les insertions publiques
CREATE POLICY "Allow public insert" ON bookings
  FOR INSERT WITH CHECK (true);

-- Autoriser les lectures publiques
CREATE POLICY "Allow public read" ON bookings
  FOR SELECT USING (true);

-- Autoriser les mises à jour publiques
CREATE POLICY "Allow public update" ON bookings
  FOR UPDATE USING (true);
```

4. Cliquez "Run"
5. Vous devriez voir "Success" au bas

## 📥 Étape 3 : Installation du Projet

### 3.1 Télécharger les fichiers
Le dossier `projet-tarek` contient tous les fichiers. Placez-le où vous voulez (ex: Documents).

### 3.2 Ouvrir dans le terminal
```bash
# Ouvrez un terminal/PowerShell
cd chemin/vers/projet-tarek
```

Sous Windows, vous pouvez aussi faire clic-droit > "Ouvrir PowerShell ici"

### 3.3 Installer les dépendances
```bash
npm install
```

Cela téléchargera tous les packages nécessaires (peut prendre 5 minutes).

## ⚙️ Étape 4 : Configuration Environnement

### 4.1 Créer le fichier .env.local
1. À la racine du dossier `projet-tarek`, créez un fichier nommé `.env.local`
2. Collez ce contenu :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4.2 Remplir les clés
1. Ouvrez `.env.local` avec un éditeur texte
2. Remplacez les valeurs par vos clés Supabase :
   - `your_supabase_url_here` → votre Project URL
   - `your_supabase_anon_key_here` → votre anon public
   - `your_service_role_key_here` → votre service_role secret

**Exemple :**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎮 Étape 5 : Lancer le Projet

### 5.1 Démarrer le serveur
```bash
npm run dev
```

Vous devriez voir :
```
> site-vitrine@1.0.0 dev
> next dev

  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1234ms
```

### 5.2 Accéder au site
Ouvrez votre navigateur et allez à : **http://localhost:3000**

Vous verrez la page d'accueil du site !

## 🧪 Étape 6 : Tester la Réservation

1. Allez sur http://localhost:3000/booking
2. Remplissez le formulaire :
   - Nom : "Jean Dupont"
   - Email : "jean@example.com"
   - Téléphone : "+33 1 23 45 67 89"
   - Service : Choisissez un service
   - Date : Demain ou plus tard
   - Heure : 10:00
3. Cliquez "Réserver Maintenant"
4. Vous devriez voir un message de succès

### Vérifier les données dans Supabase
1. Allez sur https://supabase.com
2. Ouvrez votre projet
3. Allez dans "Table Editor"
4. Cliquez sur "bookings"
5. Vous verrez votre réservation !

## 📁 Structure des Fichiers

```
projet-tarek/
├── src/
│   ├── app/                    # Pages et routes
│   │   ├── api/bookings/       # API pour réservations
│   │   ├── booking/            # Page de réservation
│   │   ├── pricing/            # Page tarifs
│   │   ├── page.tsx            # Accueil
│   │   ├── layout.tsx          # Layout global
│   │   └── globals.css         # Styles CSS
│   │
│   ├── components/             # Composants React
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── ModernBookingForm.tsx
│   │   └── OpeningHours.tsx
│   │
│   └── lib/                    # Fonctions utilitaires
│       ├── supabase.ts         # Client Supabase
│       ├── data.ts             # Données du site
│       └── email.ts            # Fonction email (optionnel)
│
├── public/                     # Images et fichiers statiques
├── .env.local                  # Variables d'environnement (SECRET!)
├── package.json                # Dépendances du projet
├── next.config.js              # Configuration Next.js
├── tailwind.config.ts          # Configuration Tailwind CSS
├── tsconfig.json               # Configuration TypeScript
└── README.md                   # Documentation du projet
```

## 🎨 Personnalisation

### Changer le nom de l'entreprise
1. Ouvrez `src/components/Header.tsx`
2. Remplacez "Elite Services" par votre nom

### Modifier les tarifs
1. Ouvrez `src/lib/data.ts`
2. Modifiez l'array `services` avec vos services

### Changer les couleurs
1. Ouvrez `tailwind.config.ts`
2. Modifiez la section `colors`:
```typescript
colors: {
  primary: '#0F172A',    // Couleur de fond
  secondary: '#1E293B',  // Couleur secondaire
  accent: '#06B6D4',     // Couleur d'accent
}
```

### Modifier les horaires
1. Ouvrez `src/lib/data.ts`
2. Modifiez `openingHours` :
```typescript
export const openingHours = {
  monday: { open: '09:00', close: '18:00', closed: false },
  // ...
}
```

## 🔧 Commandes Utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Créer une build pour production
npm run build

# Lancer le site en production
npm start

# Vérifier les erreurs (linting)
npm run lint
```

## ❌ Résolution des Problèmes

### Erreur : "Cannot find module 'next'"
```bash
npm install
```

### Erreur : "NEXT_PUBLIC_SUPABASE_URL is required"
- Vérifiez que `.env.local` existe et contient vos clés

### Erreur : "Could not connect to database"
- Vérifiez vos clés Supabase
- Vérifiez que votre projet Supabase est actif

### Port 3000 déjà utilisé
```bash
npm run dev -- -p 3001  # Utilise le port 3001 à la place
```

### Réinitialiser npm
```bash
# Windows
rmdir node_modules /s /q
del package-lock.json
npm install

# macOS/Linux
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Déploiement (Optionnel)

### Déployer sur Vercel (Recommandé)

1. **Créer un compte Vercel**
   - Allez sur https://vercel.com
   - Cliquez "Sign Up"
   - Connectez-vous avec GitHub

2. **Importer le projet**
   - Cliquez "Import Project"
   - Sélectionnez votre repo GitHub

3. **Configurer les variables**
   - Allez dans "Settings" > "Environment Variables"
   - Ajoutez vos clés Supabase

4. **Déployer**
   - Cliquez "Deploy"
   - Attendez quelques minutes
   - Votre site est en ligne !

## 💡 Astuces

- Utilisez **VS Code** pour éditer le code facilement
- L'extension **ES7+ React/Redux/React-Native snippets** aide beaucoup
- Consultez la [documentation Next.js](https://nextjs.org/docs) pour plus d'infos
- Mettez à jour npm régulièrement : `npm update -g npm`

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les messages d'erreur dans le terminal
2. Consultez la documentation des projets utilisés
3. Cherchez sur StackOverflow
4. Ouvrez une issue sur GitHub si applicable

---

**Bon développement ! 🎉**
