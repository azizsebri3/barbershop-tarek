# 🎨 Composants Documentation

## Aperçu

Ce document décrit tous les composants réutilisables du projet.

---

## Header

**Fichier:** `src/components/Header.tsx`

Navigation fixe en haut du site avec liens vers les pages principales.

### Props
Aucune prop requise - Composant autonome

### Utilisation
```tsx
import Header from '@/components/Header'

export default function Layout() {
  return (
    <>
      <Header />
      {/* Contenu */}
    </>
  )
}
```

### Caractéristiques
- ✅ Navigation responsive
- ✅ Logo de l'entreprise
- ✅ Liens vers Accueil, Services, Tarifs
- ✅ Bouton "Réserver" en accent
- ✅ Animations Framer Motion
- ✅ Backdrop blur effect

### Personnalisation
Modifiez le texte du logo :
```tsx
// src/components/Header.tsx
<Link href="/" className="text-2xl font-bold text-accent">
  Votre Nom d'Entreprise  {/* Changez ici */}
</Link>
```

---

## Footer

**Fichier:** `src/components/Footer.tsx`

Pied de page avec informations de contact et liens.

### Props
Aucune prop requise - Composant autonome

### Utilisation
```tsx
import Footer from '@/components/Footer'

export default function Layout() {
  return (
    <>
      {/* Contenu */}
      <Footer />
    </>
  )
}
```

### Contenu
- Logo et description
- Liens rapides
- Informations de contact
- Année copyright automatique

### Personnalisation
Modifiez les informations de contact :
```tsx
// src/components/Footer.tsx
<p className="text-gray-400">Email: votre-email@example.com</p>
<p className="text-gray-400">Téléphone: +33 X XX XX XX XX</p>
```

---

## Hero

**Fichier:** `src/components/Hero.tsx`

Section hero animée avec titre, description et CTA.

### Props
Aucune prop requise - Composant autonome

### Utilisation
```tsx
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <>
      <Hero />
      {/* Autres sections */}
    </>
  )
}
```

### Caractéristiques
- ✅ Titre animé au défilement
- ✅ Arrière-plan dégradé
- ✅ Éléments de fond animés
- ✅ Boutons CTA
- ✅ Statistiques (clients, projets, années)
- ✅ Animations staggered

### Personnalisation
Modifiez le titre et la description :
```tsx
// src/components/Hero.tsx
<h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6">
  Vos Services <span className="text-accent">Ici</span>
</h1>

<p className="text-lg md:text-xl text-gray-400">
  Votre description personnalisée
</p>
```

---

## ServiceCard

**Fichier:** `src/components/ServiceCard.tsx`

Carte affichant les détails d'un service (tarif, durée, description).

### Props
```typescript
interface ServiceCardProps {
  title: string              // Nom du service
  description: string        // Description courte
  price: number             // Prix en euros
  duration: number          // Durée en minutes
  icon?: React.ReactNode    // Icône optionnelle
}
```

### Utilisation
```tsx
import ServiceCard from '@/components/ServiceCard'
import { Zap } from 'lucide-react'

export default function Services() {
  return (
    <ServiceCard
      title="Consultation"
      description="Consultation professionnelle et conseils"
      price={50}
      duration={30}
      icon={<Zap />}
    />
  )
}
```

### Exemple avec Lucide Icons
```tsx
import { 
  Zap, 
  Shield, 
  Rocket, 
  Target 
} from 'lucide-react'

// Utilisez n'importe quelle icône Lucide
<ServiceCard icon={<Rocket />} {...props} />
```

### Caractéristiques
- ✅ Animation au survol
- ✅ Affichage du prix et durée
- ✅ Bouton "Réserver"
- ✅ Icône optionnelle
- ✅ Transition de couleur
- ✅ Responsive design

### Icônes disponibles
Lucide React offre 400+ icônes :
```tsx
import { 
  Star, 
  Heart, 
  Clock, 
  MapPin, 
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  // ... et beaucoup d'autres
} from 'lucide-react'
```

---

## BookingForm

**Fichier:** `src/components/BookingForm.tsx`

Formulaire complet pour réserver un rendez-vous.

### Props
Aucune prop requise - Composant autonome

### Utilisation
```tsx
import BookingForm from '@/components/BookingForm'

export default function BookingPage() {
  return (
    <div className="py-20">
      <BookingForm />
    </div>
  )
}
```

### Champs
- ✅ Nom (requis)
- ✅ Email (requis, validation)
- ✅ Téléphone (requis)
- ✅ Service (liste déroulante)
- ✅ Date (sélecteur de date)
- ✅ Heure (sélecteur d'heure)
- ✅ Message (optionnel)

### Validation
- Email format check
- Tous les champs requis
- Validation côté client
- Validation côté serveur (API)

### Gestion des erreurs
Affiche les messages d'erreur sous chaque champ :
```tsx
{errors.name && (
  <p className="text-red-400 text-sm mt-1">
    {errors.name.message}
  </p>
)}
```

### Notifications
Utilise React Hot Toast :
```tsx
// Succès
toast.success('Rendez-vous réservé avec succès!')

// Erreur
toast.error('Une erreur est survenue')
```

### Personnalisation
Modifiez les services disponibles :
```tsx
// src/lib/data.ts
export const services = [
  {
    id: 'consultation',
    name: 'Consultation',
    description: 'Description',
    price: 50,
    duration: 30,
  },
  // Ajoutez d'autres services...
]
```

---

## OpeningHours

**Fichier:** `src/components/OpeningHours.tsx`

Affiche les horaires d'ouverture et le statut en temps réel.

### Props
Aucune prop requise - Composant autonome

### Utilisation
```tsx
import OpeningHours from '@/components/OpeningHours'

export default function Home() {
  return (
    <section>
      <OpeningHours />
    </section>
  )
}
```

### Caractéristiques
- ✅ Affiche tous les jours de la semaine
- ✅ Statut "Ouvert/Fermé" en temps réel
- ✅ Couleur verte pour ouvert, rouge pour fermé
- ✅ Affiche adresse et téléphone
- ✅ Icônes Lucide React
- ✅ Design responsive

### Personnalisation
Modifiez les horaires :
```tsx
// src/lib/data.ts
export const openingHours = {
  monday: { open: '09:00', close: '18:00', closed: false },
  tuesday: { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday: { open: '09:00', close: '18:00', closed: false },
  friday: { open: '09:00', close: '19:00', closed: false },
  saturday: { open: '10:00', close: '17:00', closed: false },
  sunday: { open: '', close: '', closed: true }, // Fermé
}
```

Modifiez les informations de contact :
```tsx
// src/components/OpeningHours.tsx
<span className="text-gray-300">+33 X XX XX XX XX</span>
<span className="text-gray-300">Votre Adresse</span>
```

---

## Composants Client vs Server

### Client Components
Ont `'use client'` en haut :
```tsx
'use client'
// Utilise les hooks React (useState, useEffect, etc)
```

- Header.tsx
- Footer.tsx
- Hero.tsx
- ServiceCard.tsx
- BookingForm.tsx
- OpeningHours.tsx

### Server Components
Pas de `'use client'` :
```tsx
// Composants de page
// Peuvent accéder à la base de données directement
```

---

## Animations

Tous les composants utilisent **Framer Motion** pour les animations.

### Configuration courante
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}      // État initial
  animate={{ opacity: 1, y: 0 }}       // État final
  transition={{ duration: 0.5 }}       // Durée de l'animation
>
  Contenu
</motion.div>
```

### Animations au défilement
```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}         // Animation quand visible
  transition={{ duration: 0.5 }}
>
  Contenu qui s'anime au défilement
</motion.div>
```

### Animations au survol
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}         // Agrandir au survol
  whileTap={{ scale: 0.95 }}           // Rétrécir au clic
>
  Bouton interactif
</motion.button>
```

---

## Créer un Nouveau Composant

### Template
```tsx
'use client'

import { motion } from 'framer-motion'

interface MonComposantProps {
  titre: string
  // Autres props...
}

export default function MonComposant({ titre }: MonComposantProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-secondary rounded-lg"
    >
      <h2 className="text-2xl font-bold text-white">{titre}</h2>
      {/* Contenu */}
    </motion.div>
  )
}
```

### Classes Tailwind courantes
```tsx
// Texte
className="text-white"           // Texte blanc
className="text-accent"          // Texte couleur accent
className="text-gray-400"        // Texte gris

// Fond
className="bg-primary"           // Fond couleur primaire
className="bg-secondary"         // Fond couleur secondaire

// Spacing
className="p-4"                  // Padding
className="mb-6"                 // Margin bottom
className="gap-4"                // Gap (flexbox)

// Layout
className="flex"                 // Flexbox
className="grid"                 // Grid
className="rounded-lg"           // Border radius
className="border border-primary" // Border
```

---

## Réutiliser les Composants

### Importer
```tsx
import ServiceCard from '@/components/ServiceCard'
import OpeningHours from '@/components/OpeningHours'
```

### Boucles
```tsx
{services.map(service => (
  <ServiceCard
    key={service.id}
    title={service.name}
    description={service.description}
    price={service.price}
    duration={service.duration}
  />
))}
```

---

## Dépannage

### Le composant n'affiche rien
- Vérifiez que le composant est importé
- Vérifiez les props passées
- Consultez la console (F12)

### Les animations ne fonctionnent pas
- Assurez-vous que Framer Motion est installé : `npm install framer-motion`
- Vérifiez la syntaxe de `motion.div`

### Erreurs TypeScript
- Vérifiez les types des props
- Utilisez `React.ReactNode` pour les enfants
- Installez les types : `npm install --save-dev @types/react`

---

## Ressources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Lucide React Icons](https://lucide.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)

---

Last Updated: December 2025
