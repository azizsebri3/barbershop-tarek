# 🚀 Quick Start Guide

Démarrez en 5 minutes !

## Étape 1 : Installation (1 minute)

```bash
# Ouvrez un terminal dans le dossier du projet
cd projet-tarek

# Installez les dépendances
npm install
```

## Étape 2 : Supabase Setup (2 minutes)

1. Allez sur https://supabase.com et créez un compte
2. Créez un nouveau projet
3. Allez dans "SQL Editor"
4. Copiez-collez et exécutez ce code :

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

CREATE INDEX bookings_email_idx ON bookings(email);
CREATE INDEX bookings_date_idx ON bookings(date);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON bookings FOR SELECT USING (true);
```

## Étape 3 : Environnement (1 minute)

1. Créez un fichier `.env.local` à la racine
2. Copiez ces clés de Supabase (Settings > API) :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_ici
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_ici
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_ici
```

## Étape 4 : Lancer (1 minute)

```bash
npm run dev
```

Ouvrez http://localhost:3000 dans votre navigateur 🎉

---

## ✅ Tests Rapides

### Test 1 : Visite les pages
- Accueil: http://localhost:3000
- Tarifs: http://localhost:3000/pricing
- Réservation: http://localhost:3000/booking

### Test 2 : Réserve un rendez-vous
1. Allez sur `/booking`
2. Remplissez le formulaire
3. Cliquez "Réserver"
4. Vous verrez un message de succès ✓

### Test 3 : Vérifie la base de données
1. Allez sur supabase.com
2. Ouvrez votre projet
3. Allez dans "Table Editor"
4. Cliquez "bookings"
5. Vous verrez votre réservation !

---

## 📝 Personnalisez en 2 minutes

### Changez le nom de l'entreprise
Ouvrez `src/components/Header.tsx`, ligne ~15 :
```tsx
<Link href="/" className="text-2xl font-bold text-accent">
  Votre Nom Ici  {/* Changez ici */}
</Link>
```

### Changez les services
Ouvrez `src/lib/data.ts`, cherchez `export const services` et modifiez.

### Changez les horaires
Ouvrez `src/lib/data.ts`, cherchez `export const openingHours` et modifiez.

### Changez les couleurs
Ouvrez `tailwind.config.ts` et modifiez :
```typescript
colors: {
  primary: '#0F172A',    // Fond
  secondary: '#1E293B',  // Secondaire
  accent: '#06B6D4',     // Boutons/accents
}
```

---

## 📚 Documentation Complète

- **INSTALLATION.md** - Guide d'installation détaillé
- **ENVIRONMENT.md** - Variables d'environnement
- **README.md** - Documentation complète
- **API.md** - Documentation API
- **COMPONENTS.md** - Guide des composants
- **DEPENDENCIES.md** - Explications dépendances
- **CHECKLIST.md** - Checklist de vérification

---

## 🆘 Problèmes Courants

### "Cannot find module 'next'"
```bash
npm install
```

### "SUPABASE_URL is undefined"
- Vérifiez que `.env.local` existe
- Vérifiez que les clés Supabase sont complètes
- Redémarrez : `npm run dev`

### Port 3000 déjà utilisé
```bash
npm run dev -- -p 3001
```

### Réservation ne se sauvegarde pas
- Vérifiez les clés Supabase
- Vérifiez que la table `bookings` existe
- Ouvrez DevTools (F12) > Console pour voir les erreurs

---

## 🎯 Prochaines Étapes

1. ✅ Testez localement
2. ✅ Personnalisez le contenu
3. ✅ Ajoutez des images
4. ✅ Configurez l'email (optionnel)
5. ✅ Déployez sur Vercel

---

## 🚀 Déployer en 5 minutes (Optionnel)

### Sur Vercel
```bash
# 1. Créez un compte sur vercel.com

# 2. Connectez votre GitHub
git init
git add .
git commit -m "Initial commit"
git push

# 3. Importez sur Vercel.com
# 4. Ajoutez les variables d'env Supabase
# 5. Deploy ! 🎉
```

---

## 💡 Tips

- **F12** = Ouvrir DevTools pour déboguer
- **Ctrl+Shift+R** = Hard refresh (vider cache)
- Consultez la console pour les erreurs
- Lisez les messages toast pour le feedback

---

## 🤝 Support

Questions ? Consultez :
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)

---

**Bienvenue dans votre nouveau site ! 🎉**

Bon développement !
