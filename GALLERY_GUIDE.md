# 📸 Système de Galerie Photos - Tarek Salon

## ✅ Installation Complète

Le système de galerie photo a été installé et configuré avec succès !

## 🎯 Fonctionnalités

### Pour les visiteurs :
- ✅ Affichage des photos du salon sur la page d'accueil
- ✅ Lightbox avec zoom pour voir les photos en grand
- ✅ Navigation fluide avec animations
- ✅ Responsive sur tous les appareils

### Pour l'administrateur :
- ✅ Interface d'upload avec drag & drop
- ✅ Gestion des photos (upload/suppression)
- ✅ Affichage du nombre de photos
- ✅ Feedback en temps réel

## 📁 Fichiers Créés

### API Routes
- `src/app/api/gallery/route.ts` - API pour gérer les photos (GET/POST/DELETE)

### Composants
- `src/components/Gallery.tsx` - Galerie publique avec lightbox
- `src/components/admin/AdminNav.tsx` - Navigation admin avec menu

### Pages Admin
- `src/app/admin/gallery/page.tsx` - Interface d'upload et gestion des photos

## 🚀 Comment Utiliser

### 1. Accéder à l'interface admin
```
http://localhost:3000/admin/gallery
```

### 2. Uploader des photos
- Cliquez sur la zone d'upload ou glissez-déposez vos photos
- Formats acceptés : JPEG, PNG, WEBP
- Taille max : 10 MB par photo
- Les photos sont automatiquement optimisées

### 3. Gérer les photos
- Cliquez sur l'icône de poubelle pour supprimer une photo
- Les photos sont affichées dans une grille responsive
- Confirmation avant suppression

### 4. Voir le résultat
```
http://localhost:3000/
```
La galerie s'affiche automatiquement sur la page d'accueil !

## 🗄️ Stockage Supabase

Les photos sont stockées dans Supabase Storage :
- **Bucket** : `salon-photos`
- **Accès** : Public (lecture seule)
- **Limite** : 10 MB par fichier
- **Types** : image/jpeg, image/png, image/webp

### Politiques de sécurité configurées :
```sql
-- Lecture publique
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'salon-photos');

-- Upload authentifié
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'salon-photos');

-- Suppression authentifiée
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'salon-photos');
```

## 🎨 Navigation Admin

Le menu admin a été mis à jour avec :
- 📊 Tableau de bord
- 📸 Galerie Photos (nouveau)
- 🚪 Déconnexion

## 🔧 Configuration Technique

### Dépendances ajoutées :
```json
{
  "react-dropzone": "^14.3.5"
}
```

### Variables d'environnement requises :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
```

## 📱 Interface Responsive

La galerie s'adapte automatiquement :
- **Mobile** : 1 colonne
- **Tablette** : 2 colonnes
- **Desktop** : 3 colonnes

## ⚡ Optimisations

- ✅ Chargement lazy des images
- ✅ Animations fluides avec Framer Motion
- ✅ Feedback utilisateur avec toasts
- ✅ Gestion des erreurs
- ✅ Validation des fichiers côté client et serveur

## 🎯 Prochaines Étapes Recommandées

1. **Uploader vos photos**
   - Connectez-vous à `/admin/gallery`
   - Uploadez 6-12 photos de qualité du salon
   - Mélangez : intérieur du salon, coiffures, ambiance

2. **Optimiser les photos avant upload**
   - Résolution recommandée : 1920x1080px maximum
   - Compresser avec TinyPNG ou similaire
   - Recadrer au format paysage (16:9)

3. **Tester sur mobile**
   - Vérifier l'affichage responsive
   - Tester le lightbox
   - Vérifier la vitesse de chargement

4. **SEO des images**
   - Les noms de fichiers sont automatiques
   - Considérer d'ajouter des alt texts (future amélioration)

## 🐛 Dépannage

### Les photos ne s'affichent pas ?
1. Vérifier que Supabase Storage est bien configuré
2. Vérifier les variables d'environnement dans `.env.local`
3. Vérifier les politiques de sécurité dans Supabase

### Erreur lors de l'upload ?
1. Vérifier la taille du fichier (< 10 MB)
2. Vérifier le format (JPEG/PNG/WEBP uniquement)
3. Vérifier la clé `SUPABASE_SERVICE_ROLE_KEY`

### Erreur 401 ou 403 ?
1. Vérifier les politiques de sécurité Supabase
2. Vérifier que le bucket est public en lecture
3. Regénérer les clés API si nécessaire

## 📊 Structure du Bucket Supabase

```
salon-photos/
├── photo-1234567890.jpg
├── photo-1234567891.jpg
├── photo-1234567892.jpg
└── ...
```

Les noms de fichiers sont générés automatiquement :
- Format : `photo-{timestamp}.{extension}`
- Exemple : `photo-1704048000000.jpg`

## 🎨 Personnalisation

### Modifier le nombre de colonnes :
Éditez `src/components/Gallery.tsx` :
```tsx
// Ligne ~50
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Modifier la taille maximale :
Éditez `src/app/api/gallery/route.ts` :
```tsx
// Ligne ~15
const maxSize = 10 * 1024 * 1024 // 10 MB
```

### Ajouter plus de formats :
```tsx
// Ligne ~16
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
```

## ✨ Résumé

Votre système de galerie est maintenant fonctionnel et prêt à l'emploi ! Vous pouvez :

1. ✅ Uploader des photos depuis l'interface admin
2. ✅ Les visiteurs peuvent voir les photos sur la page d'accueil
3. ✅ Gérer facilement toutes vos photos
4. ✅ Profiter d'une interface moderne et responsive

**Il ne reste qu'à uploader vos photos du salon ! 📸**

---

**Développé avec ❤️ pour Tarek Salon**
*Namur, Belgique - 2025*
