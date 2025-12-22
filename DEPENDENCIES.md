# 📦 Dépendances du Projet

## Vue d'ensemble

Ce projet utilise les technologies modernes suivantes. Voici un guide complet.

---

## Production Dependencies

### Next.js 15
```json
{
  "next": "^15.0.0"
}
```
**Framework React** pour le rendu côté serveur et la génération de sites statiques.

Documentation: https://nextjs.org/docs

**Utilisé pour:**
- Pages et routes
- API routes (`/api/bookings`)
- Optimisation des images
- Déploiement Vercel

---

### React 19
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```
**Bibliothèque UI** pour créer des interfaces utilisateur.

Documentation: https://react.dev

**Utilisé pour:**
- Composants
- Hooks (useState, useEffect, etc.)
- Rendu conditionnel

---

### Framer Motion 11
```json
{
  "framer-motion": "^11.0.0"
}
```
**Bibliothèque d'animations** pour les transitions fluides.

Documentation: https://www.framer.com/motion/

**Utilisé pour:**
- Animations d'entrée/sortie
- Animations au survol
- Animations au défilement
- Transitions de page

**Exemples:**
```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Contenu animé
</motion.div>
```

---

### React Hook Form 7.48
```json
{
  "react-hook-form": "^7.48.0"
}
```
**Gestion des formulaires** performante et flexible.

Documentation: https://react-hook-form.com/

**Utilisé pour:**
- Formulaire de réservation
- Validation des champs
- Gestion des erreurs

**Exemple:**
```tsx
const { register, handleSubmit, formState: { errors } } = useForm()

<input {...register('name', { required: true })} />
{errors.name && <p>Le nom est requis</p>}
```

---

### React Hot Toast 2.4
```json
{
  "react-hot-toast": "^2.4.1"
}
```
**Notifications toast** simples et élégantes.

Documentation: https://react-hot-toast.com/

**Utilisé pour:**
- Message de succès après réservation
- Messages d'erreur
- Notifications utilisateur

**Exemple:**
```tsx
import toast, { Toaster } from 'react-hot-toast'

<Toaster position="top-right" />

toast.success('Réservation réussie!')
toast.error('Une erreur est survenue')
```

---

### Supabase 2.38
```json
{
  "@supabase/supabase-js": "^2.38.0"
}
```
**Client JavaScript** pour Supabase (PostgreSQL + Auth).

Documentation: https://supabase.com/docs

**Utilisé pour:**
- Connexion à la base de données
- Opérations CRUD sur `bookings`
- Authentification (future)

**Exemple:**
```tsx
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase
  .from('bookings')
  .insert({ name: 'Jean', email: 'jean@example.com' })
```

---

### Lucide React (optionnel)
```json
{
  "lucide-react": "latest"
}
```
**Icônes SVG** modernes et customisables.

Documentation: https://lucide.dev

**Utilisé pour:**
- Icônes de navigation
- Icônes dans les services
- Icônes de contact

**Exemple:**
```tsx
import { Clock, MapPin, Phone } from 'lucide-react'

<Clock size={24} className="text-accent" />
```

---

## Dev Dependencies

### TypeScript 5.3
```json
{
  "typescript": "^5.3.3"
}
```
**Langage typé** pour JavaScript.

**Avantages:**
- Détection d'erreurs
- Auto-complétion améliorée
- Documentation du code

---

### Tailwind CSS 3.4
```json
{
  "tailwindcss": "^3.4.0"
}
```
**Framework CSS utilitaire** pour le design.

Documentation: https://tailwindcss.com/docs

**Utilisé pour:**
- Styles responsifs
- Dark mode
- Animations CSS
- Classes utilitaires

**Exemple:**
```tsx
<div className="p-4 bg-primary rounded-lg text-white">
  Contenu stylisé
</div>
```

---

### PostCSS 8.4
```json
{
  "postcss": "^8.4.31"
}
```
**Traitement CSS** pour Tailwind et autoprefixer.

---

### Autoprefixer 10.4
```json
{
  "autoprefixer": "^10.4.16"
}
```
**Ajoute automatiquement** les préfixes navigateur CSS.

---

### ESLint 8.54
```json
{
  "eslint": "^8.54.0",
  "eslint-config-next": "^15.0.0"
}
```
**Linter** pour la qualité du code.

**Vérifier le code:**
```bash
npm run lint
```

---

### @types/* packages
```json
{
  "@types/node": "^20.10.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0"
}
```
**Définitions TypeScript** pour les dépendances JavaScript.

---

## Package Manager

### npm 9+
**Gestionnaire de paquets** (vient avec Node.js).

**Commandes principales:**
```bash
npm install          # Installe les dépendances
npm run dev          # Démarre le serveur
npm run build        # Crée une build
npm run lint         # Vérifie le code
npm update           # Met à jour les paquets
```

---

## Node.js Versions

### Requise
- **Node.js 18+** (LTS recommandé)
- **npm 9+**

### Vérifier
```bash
node --version       # v18.x.x ou supérieur
npm --version        # 9.x.x ou supérieur
```

### Installer
- **Windows/macOS:** https://nodejs.org/
- **Linux:** `sudo apt-get install nodejs npm`

---

## Installation des Dépendances

### Première installation
```bash
# À la racine du projet
npm install
```

Cela créera un dossier `node_modules` (peut être gros - 500MB+).

### Mettre à jour une dépendance spécifique
```bash
npm install framer-motion@latest
```

### Ajouter une nouvelle dépendance
```bash
npm install package-name

# Ou pour dev dependency
npm install --save-dev package-name
```

### Supprimer une dépendance
```bash
npm uninstall package-name
```

---

## Optionnel: Email Integration

Si vous voulez ajouter les confirmations par email :

### Option 1: Resend (Recommandé)
```bash
npm install resend
```

Configuration:
```typescript
// .env.local
RESEND_API_KEY=re_xxxxxxxxxxxx
```

### Option 2: SendGrid
```bash
npm install @sendgrid/mail
```

### Option 3: Nodemailer
```bash
npm install nodemailer
```

---

## Taille du Projet

| Partie | Taille |
|--------|--------|
| node_modules | ~500MB |
| .next (build) | ~50MB |
| src/ | ~100KB |
| Total (git) | ~200KB |

**.gitignore** exclut déjà `node_modules` et `.next`.

---

## Versions Compétentes

```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

Ajoutez ceci à `package.json` pour spécifier les versions requises.

---

## Audit de Sécurité

Vérifier s'il y a des vulnérabilités :

```bash
npm audit
```

Corriger les vulnérabilités :

```bash
npm audit fix
```

---

## Mise à Jour des Dépendances

Vérifier les mises à jour disponibles :

```bash
npm outdated
```

Mettre à jour tout :

```bash
npm update
```

---

## Dépannage des Dépendances

### Erreur : "Module not found"
```bash
# Supprimez node_modules et réinstallez
rm -rf node_modules package-lock.json
npm install
```

### Erreur : "Cannot find module 'next'"
```bash
npm install next
```

### Port déjà utilisé
```bash
npm run dev -- -p 3001  # Utilise port 3001
```

---

## Performance

### Réduction de la taille
Les dépendances utilisées sont déjà optimisées :
- Framer Motion: 30KB (gzipped)
- React Hook Form: 20KB (gzipped)
- Supabase JS: 40KB (gzipped)
- Lucide Icons: Chargées à la demande

### Lazy Loading
Les composants utilisent le `lazy loading` automatique avec Next.js.

---

## Production

Pour la production, utilisez :

```bash
npm run build      # Crée une build optimisée
npm start          # Démarre le serveur
```

Vercel gère tout automatiquement au déploiement.

---

## Dépendances Alternatives

Si vous voulez remplacer certaines dépendances :

| Actuelle | Alternative | Notes |
|----------|-------------|-------|
| Framer Motion | React Spring | Plus léger |
| React Hook Form | Formik | Plus old school |
| Tailwind CSS | styled-components | Plus flexible |
| Supabase | Firebase | Plus coûteux |
| React Hot Toast | Toastify | Alternatif populaire |

---

## Ressources

- [npm Documentation](https://docs.npmjs.com/)
- [Package Comparison Tool](https://www.npmtrends.com/)
- [Bundlephobia](https://bundlephobia.com/) - Taille des packages
- [Libraries.io](https://libraries.io/) - Dépendances alternatives

---

Last Updated: December 2025
