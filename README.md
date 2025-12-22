# 🎯 Elite Services - Site Vitrine Moderne

Un site vitrine moderne créé avec **Next.js 15**, **TypeScript**, **Tailwind CSS** et **Framer Motion**. 
Incluant un système complet de réservation de rendez-vous avec base de données Supabase et animations fluides.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)
![React](https://img.shields.io/badge/React-19-61DAFB)

## ✨ Fonctionnalités

### 📱 Design & UX
- ✅ **Design Responsive** : Compatible mobile, tablet et desktop
- ✅ **Animations Modernes** : Transitions fluides avec Framer Motion
- ✅ **Dark Mode** : Interface élégante avec palette de couleurs modernes
- ✅ **Performance** : Optimisé pour les Core Web Vitals
- ✅ **Scroll Animations** : Animations au défilement pour une meilleure expérience

### 📅 Système de Réservation
- ✅ **Formulaire Dynamique** : Sélection date/heure/service
- ✅ **Validation Complète** : Validation côté client et serveur
- ✅ **Intégration Supabase** : Stockage sécurisé des réservations
- ✅ **Notifications** : Feedback utilisateur avec React Hot Toast
- ✅ **API REST** : Routes API pour créer, lire, mettre à jour et supprimer les réservations

### 💰 Section Tarifs
- ✅ **Tarifs Détaillés** : Affichage complet des services et prix
- ✅ **Tableau Comparatif** : Comparaison des caractéristiques
- ✅ **FAQ** : Questions fréquentes avec réponses
- ✅ **Options Flexibles** : 4 niveaux de service différents

### 🕐 Horaires d'Ouverture
- ✅ **Affichage Dynamique** : Horaires par jour de la semaine
- ✅ **Statut en Temps Réel** : Indicateur ouvert/fermé
- ✅ **Information Contact** : Adresse et téléphone affichés

### 🎨 Composants Réutilisables
- ✅ Header avec navigation
- ✅ Footer informatif
- ✅ Hero section animée
- ✅ ServiceCard avec animations
- ✅ BookingForm complet
- ✅ OpeningHours
- ✅ Facilement extensible

## 🛠️ Stack Technologique

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling utilitaire
- **Framer Motion** - Animations
- **React Hook Form** - Gestion des formulaires
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend & Database
- **Supabase** - Base de données PostgreSQL
- **Next.js API Routes** - API backend
- **Node.js** - Runtime

### DevTools
- **ESLint** - Linting
- **TypeScript** - Type checking
- **npm** - Package manager

## 📋 Prérequis

- **Node.js** : v18+ 
- **npm** : v9+
- **Compte Supabase** : https://supabase.com
- **Git** (optionnel)

## 🚀 Installation & Démarrage

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration Supabase

#### Créer un compte Supabase
1. Allez sur https://supabase.com
2. Créez un nouveau projet
3. Notez votre **URL Supabase** et **Clé Anon**

#### Créer la table des réservations
Dans l'éditeur SQL de Supabase, exécutez :

```sql
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

-- Index pour performance
CREATE INDEX bookings_email_idx ON bookings(email);
CREATE INDEX bookings_date_idx ON bookings(date);

-- Enable RLS (Row Level Security) - optionnel mais recommandé
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public read/insert
CREATE POLICY "Allow public insert" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select" ON bookings
  FOR SELECT USING (true);
```

#### Configurer les variables d'environnement
Créez un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

L'application est disponible à `http://localhost:3000`

## 📚 Structure du Projet

```
projet-tarek/
├── public/                 # Fichiers statiques
├── src/
│   ├── app/
│   │   ├── api/           # Routes API
│   │   │   └── bookings/
│   │   │       ├── route.ts         # GET, POST
│   │   │       └── [id]/route.ts    # GET, PUT, DELETE
│   │   ├── booking/        # Page de réservation
│   │   ├── pricing/        # Page tarifs
│   │   ├── layout.tsx      # Layout global
│   │   ├── page.tsx        # Page d'accueil
│   │   └── globals.css     # Styles globaux
│   ├── components/         # Composants réutilisables
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── BookingForm.tsx
│   │   └── OpeningHours.tsx
│   └── lib/               # Utilitaires
│       ├── supabase.ts    # Client Supabase
│       └── data.ts        # Données et fonctions utiles
├── .env.local.example     # Template env
├── .eslintrc.json         # Config ESLint
├── next.config.mjs        # Config Next.js
├── tailwind.config.ts     # Config Tailwind
├── tsconfig.json          # Config TypeScript
├── package.json
└── README.md
```

## 🎨 Personnalisation

### Modifier les couleurs
Éditez `tailwind.config.ts` :

```typescript
colors: {
  primary: '#0F172A',    // Bleu foncé
  secondary: '#1E293B',  // Bleu gris
  accent: '#06B6D4',     // Cyan
}
```

### Modifier les services et tarifs
Éditez `src/lib/data.ts` :

```typescript
export const services = [
  {
    id: 'consultation',
    name: 'Consultation',
    description: 'Description du service',
    price: 50,
    duration: 30,
  },
  // Ajoutez d'autres services...
]
```

### Modifier les horaires
Éditez `src/lib/data.ts` :

```typescript
export const openingHours: OpeningHours = {
  monday: { open: '09:00', close: '18:00', closed: false },
  // Modifiez les horaires...
}
```

### Modifier les animations
Les animations sont créées avec **Framer Motion**. Éditez les composants pour ajuster :
- `initial` - État initial
- `animate` - État final
- `transition` - Durée et type
- `whileHover` - Animation au survol

Exemple :
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Contenu
</motion.div>
```

## 📧 Configuration Email (Optionnel)

Pour envoyer des confirmations par email, vous avez plusieurs options :

### Option 1: SendGrid
```bash
npm install @sendgrid/mail
```

### Option 2: Nodemailer
```bash
npm install nodemailer
```

### Option 3: Resend
```bash
npm install resend
```

Exemple avec Resend :
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@example.com',
  to: email,
  subject: 'Confirmation de réservation',
  html: `<p>Merci pour votre réservation...</p>`
});
```

## 🚢 Déploiement

### Déployer sur Vercel (Recommandé)

1. **Push le projet sur GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connectez-vous à Vercel**
- Allez sur https://vercel.com
- Cliquez "Import Project"
- Sélectionnez votre repo GitHub

3. **Configurez les variables d'environnement**
- Ajoutez vos clés Supabase dans les settings de Vercel
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Déployez !**
```
Le site est en ligne 🎉
```

### Déployer sur Netlify

```bash
npm run build

# Ou avec Netlify CLI
netlify deploy --prod --dir=.next
```

## 📱 Tests Responsivité

- **Mobile** : 320px, 375px, 425px
- **Tablet** : 768px, 1024px
- **Desktop** : 1440px, 1920px

Testez avec :
- Chrome DevTools
- Firefox Responsive Design Mode
- Safari Developer Tools

## 🔒 Sécurité

- ✅ Variables d'environnement sensibles (.env.local)
- ✅ Validation des formulaires côté client et serveur
- ✅ SQL Injection protection (Supabase parameterized queries)
- ✅ CORS configuré via Next.js
- ✅ Helmet pour les headers de sécurité
- ✅ Rate limiting recommandé pour production

## 🐛 Débogage

### Logs serveur
```bash
# Vérifier les logs dans la console
npm run dev
```

### Supabase
- Consultez l'onglet "Realtime" dans Supabase pour les changements
- Utilisez l'SQL Editor pour vérifier les données

### Network
- Ouvrez DevTools (F12)
- Allez dans "Network"
- Fillez "Fetch/XHR" pour voir les requêtes API

## 📈 Performance

Optimisations déjà en place :
- ✅ Image optimization (Next.js Image)
- ✅ Code splitting
- ✅ Lazy loading avec Framer Motion
- ✅ Compression CSS avec Tailwind
- ✅ Minification automatique

Vérifiez avec :
```bash
npm run build
npm start
```

## 🤝 Support & Contributions

Pour les problèmes :
1. Vérifiez que Node.js v18+ est installé
2. Supprimez `node_modules` et `.next`, puis faites `npm install`
3. Vérifiez les clés Supabase dans `.env.local`
4. Consultez les logs du serveur de développement

## 📄 License

MIT - Libre d'utilisation

## 🎓 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Hook Form](https://react-hook-form.com/)

---

**Créé avec ❤️ en 2025**

Profitez de votre nouveau site vitrine ! 🚀
