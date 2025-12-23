# Backoffice d'Administration

## Accès à l'administration

1. **Via le site web** : Cliquez sur l'icône ⚙️ en haut à droite du header
2. **Directement** : Allez sur `/admin`

**Mot de passe par défaut** : `admin123`

## Fonctionnalités disponibles

### 🏢 **Informations Générales**
- Modifier le nom du salon
- Changer la description
- Mettre à jour les coordonnées (téléphone, email, adresse)
- Liens vers les réseaux sociaux

### 🕐 **Horaires d'Ouverture**
- Modifier les horaires pour chaque jour
- Fermer temporairement certains jours
- Validation automatique des réservations selon les horaires

### ✂️ **Gestion des Services**
- Ajouter de nouveaux services
- Modifier les services existants (nom, description, prix, durée)
- Supprimer des services
- Réorganiser l'ordre d'affichage

### 🖼️ **Gestion des Images**
- Changer l'image hero (arrière-plan)
- Modifier le logo du salon
- Gérer les photos du portfolio
- Ajouter/supprimer des photos de témoignages

## Stockage des données

Actuellement, toutes les modifications sont sauvegardées dans le `localStorage` du navigateur pour la démonstration. En production, il faudrait :

1. **Base de données** : Stocker les données dans Supabase ou une autre BDD
2. **Stockage cloud** : Utiliser AWS S3, Cloudinary pour les images
3. **Cache/Redis** : Pour les performances

## Sécurité

- **Authentification simple** : Mot de passe en clair (à améliorer en production)
- **Protection des routes** : Vérification côté client
- **Validation des données** : Sanitisation des inputs

## Utilisation en production

1. **Changer le mot de passe admin** dans `.env.local`
2. **Configurer Supabase** pour la persistance des données
3. **Ajouter un système de stockage cloud** pour les images
4. **Implémenter une authentification plus robuste** (JWT, sessions)

## API Endpoints

- `GET/POST /api/admin/settings` - Gestion des paramètres généraux
- `GET/POST /api/admin/hours` - Gestion des horaires
- `GET/POST /api/admin/services` - Gestion des services
- `POST /api/admin/upload` - Upload d'images

---

**Note** : Cette interface d'administration est une version de démonstration. Pour un usage en production, il faudrait ajouter plus de sécurité, de validation, et connecter à une vraie base de données.