# 🎯 Tarek Salon - Modern Barbershop Booking Platform

A modern barbershop booking platform built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**. 
Features a complete appointment booking system with Supabase database, admin panel, multilanguage support, and PWA capabilities.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)
![React](https://img.shields.io/badge/React-19-61DAFB)
![PWA](https://img.shields.io/badge/PWA-Ready-success)

## ✨ Features

### 📱 Design & UX
- ✅ **Responsive Design**: Mobile, tablet, and desktop compatible
- ✅ **Modern Animations**: Smooth transitions with Framer Motion
- ✅ **Elegant Interface**: Modern color palette with gold accents
- ✅ **Performance**: Optimized for Core Web Vitals
- ✅ **PWA Support**: Installable as mobile/desktop app
- ✅ **Scroll Animations**: Engaging scroll-based interactions
- ✅ **Image Gallery**: Swiper-based salon photo gallery

### 📅 Booking System
- ✅ **Dynamic Form**: Date/time/service selection
- ✅ **Complete Validation**: Client and server-side validation
- ✅ **Supabase Integration**: Secure booking storage
- ✅ **Notifications**: User feedback with React Hot Toast
- ✅ **REST API**: Full CRUD operations for bookings
- ✅ **Real-time Updates**: Instant booking confirmations
- ✅ **Client Cancellation**: Clients can cancel appointments with notes via email link

### 👨‍💼 Admin Panel
- ✅ **Dashboard**: Comprehensive booking overview
- ✅ **Booking Management**: View, update, and delete bookings
- ✅ **Client History**: Track returning clients
- ✅ **Service Management**: Add/edit/delete services
- ✅ **Opening Hours**: Manage schedule for each day
- ✅ **General Settings**: Salon information configuration
- ✅ **Image Gallery**: Upload and manage salon photos
- ✅ **Cancellation Notes**: View client cancellation reasons
- ✅ **English Interface**: Admin panel fully translated to English

### 🌍 Multilanguage Support
- ✅ **French**: Default language for clients
- ✅ **English**: Admin panel interface
- ✅ **Translation System**: Centralized translation management
- ✅ **Dual Interface**: French frontend + English admin

### 💰 Pricing Section
- ✅ **Detailed Pricing**: Complete service and price display
- ✅ **Service Cards**: Visual presentation of services
- ✅ **FAQ**: Frequently asked questions
- ✅ **Flexible Options**: Multiple service levels

### 🕐 Opening Hours
- ✅ **Dynamic Display**: Hours for each day of the week
- ✅ **Real-time Status**: Open/closed indicator
- ✅ **Contact Information**: Address and phone displayed
- ✅ **Admin Editable**: Update hours from admin panel

### 📱 PWA Features
- ✅ **Installable**: Add to home screen on mobile/desktop
- ✅ **Offline Support**: Service worker with caching
- ✅ **Push Notifications**: Ready for booking reminders
- ✅ **App Icons**: Multiple sizes for all devices
- ✅ **Manifest**: Complete PWA configuration
- ✅ **Fast Loading**: Optimized for mobile networks

### 🎨 Reusable Components
- ✅ Header with language switcher
- ✅ Informative footer
- ✅ Animated hero section
- ✅ ServiceCard with animations
- ✅ Complete BookingForm
- ✅ OpeningHours display
- ✅ Admin components
- ✅ Image uploader
- ✅ Easily extensible

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Swiper** - Touch slider

### Backend & Database
- **Supabase** - PostgreSQL database + Storage
- **Next.js API Routes** - Backend API
- **Node.js** - Runtime

### PWA
- **Service Worker** - Offline support
- **Web App Manifest** - PWA configuration
- **Workbox** - Service worker helpers

### DevTools
- **ESLint** - Linting
- **TypeScript** - Type checking
- **npm** - Package manager

## 📋 Prerequisites

- **Node.js**: v18+ 
- **npm**: v9+
- **Supabase Account**: https://supabase.com
- **Git** (optional)

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Configuration

#### Create Supabase Account
1. Go to https://supabase.com
2. Create a new project
3. Note your **Supabase URL** and **Anon Key**

#### Create Required Tables
In Supabase SQL Editor, execute:

```sql
-- Bookings table
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
├── public/                 # Static files
│   ├── icons/             # PWA app icons
│   ├── manifest.json      # PWA manifest
│   ├── sw.js             # Service worker
│   └── register-sw.js    # SW registration
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── bookings/  # Booking CRUD
│   │   │   ├── services/  # Service management
│   │   │   ├── hours/     # Opening hours
│   │   │   ├── settings/  # General settings
│   │   │   └── gallery/   # Image gallery
│   │   ├── admin/         # Admin panel pages
│   │   │   └── dashboard/ # Admin dashboard
│   │   ├── booking/       # Booking page
│   │   ├── pricing/       # Pricing page
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Homepage
│   │   └── globals.css    # Global styles
│   ├── components/        # Reusable components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── BookingForm.tsx
│   │   ├── OpeningHours.tsx
│   │   └── admin/         # Admin components
│   │       ├── AdminBookings.tsx
│   │       ├── AdminHistory.tsx
│   │       ├── AdminServices.tsx
│   │       ├── AdminHours.tsx
│   │       ├── AdminGeneral.tsx
│   │       └── AdminImages.tsx
│   └── lib/               # Utilities
│       ├── supabase.ts    # Supabase client
│       ├── data.ts        # Site data
│       ├── email.ts       # Email utilities
│       ├── language-context.tsx  # Language provider
│       └── admin-translations.ts # Admin English translations
├── .env.local.example     # Environment template
├── .eslintrc.json         # ESLint config
├── next.config.mjs        # Next.js config
├── tailwind.config.ts     # Tailwind config
├── tsconfig.json          # TypeScript config
├── package.json
└── README.md
```

## 👨‍💼 Admin Panel

Access the admin panel at `/admin/dashboard`

### Features
- **Dashboard**: Overview of bookings and statistics
- **Bookings**: Manage all appointments (view, update status, delete)
- **History**: Track client visit history
- **Services**: Add, edit, and delete services with pricing
- **Opening Hours**: Set opening/closing times for each day
- **General Settings**: Update salon information
- **Gallery**: Upload and manage salon photos
- **English Interface**: Complete English translation for admin

### Admin Database Setup

Create additional tables for services, hours, and settings:

```sql
-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Opening hours table
CREATE TABLE opening_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week VARCHAR(20) NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create storage bucket for salon photos
-- Go to Storage in Supabase and create a bucket named 'salon-photos'
-- Make it public for gallery display
```

### Admin Authentication
To protect the admin panel, you can add authentication:
1. Use Supabase Auth
2. Add middleware to check auth status
3. Redirect unauthorized users

Example with Supabase Auth:
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}
```

##  PWA (Progressive Web App)

This project is PWA-ready! Users can install it on their mobile or desktop devices.

### Features
- ✅ **Installable**: Add to home screen on mobile/desktop
- ✅ **Offline Support**: Service worker caches essential resources
- ✅ **Push Notifications**: Ready for booking reminders
- ✅ **App Icons**: 8 different sizes (72px to 512px)
- ✅ **Manifest**: Complete PWA configuration
- ✅ **Fast Loading**: Optimized for mobile networks

### Testing PWA Installation

#### On Chrome/Edge (Desktop)
1. Visit your deployed site (must be HTTPS)
2. Look for the install icon in the address bar
3. Click "Install" to add to desktop

#### On Chrome (Android)
1. Open your site on mobile
2. Tap the menu (⋮)
3. Select "Install app" or "Add to Home screen"

#### On Safari (iOS)
1. Open your site on iPhone/iPad
2. Tap the Share button
3. Select "Add to Home Screen"

### PWA Files
- `/public/manifest.json` - PWA configuration
- `/public/sw.js` - Service worker for offline support
- `/public/register-sw.js` - Service worker registration
- `/public/icons/` - App icons (72x72 to 512x512)

### Verify PWA Readiness
```bash
# Run Lighthouse audit
npm run build
npm start
# Then open Chrome DevTools > Lighthouse > Run PWA audit
```

Or use online tools:
- [PWABuilder](https://www.pwabuilder.com/)
- [Chrome DevTools Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Customizing PWA
Edit `/public/manifest.json` to customize:
- App name and short name
- Theme colors
- Display mode
- App description

```json
{
  "name": "Your Salon Name",
  "short_name": "Salon",
  "theme_color": "#D4AF37",
  "background_color": "#1a1a2e"
}
```

## � Multilanguage Support

The project supports dual-language configuration:
- **French** (default): For client-facing pages
- **English**: For admin panel interface

### Language Files
- `/src/lib/language-context.tsx` - Language provider and switcher
- `/src/lib/admin-translations.ts` - English translations for admin panel

### Using Translations in Admin

```typescript
import { translations } from '@/lib/admin-translations';

// Access translations
const t = translations.bookings;
console.log(t.title); // "Bookings Management"
```

### Adding New Translations
Edit `/src/lib/admin-translations.ts`:

```typescript
export const translations = {
  // ... existing translations
  newSection: {
    title: 'New Section',
    description: 'Section description',
    // Add more keys...
  }
};
```

### Language Switcher
The Header component includes a language switcher that allows users to toggle between French and English. Admin panel is always in English regardless of the selected language.

## �🎨 Personnalisation

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
