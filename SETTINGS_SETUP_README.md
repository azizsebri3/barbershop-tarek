# Configuration des Paramètres Admin

## Problème Résolu
Les paramètres admin ne se sauvegardaient pas dans la base de données à cause des politiques RLS (Row Level Security) qui bloquaient les opérations côté client.

## Solution Implémentée
- ✅ Création d'une API route côté serveur (`/api/settings`) qui utilise la clé service role
- ✅ Modification du hook `useGeneralSettings` pour utiliser l'API au lieu d'accéder directement à Supabase
- ✅ Création du script SQL pour configurer la table `settings` et les politiques RLS

## Étapes à Suivre

### 1. Obtenir la Clé Service Role
1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez la **service_role key** (clé secrète)
5. Remplacez `votre_clé_service_role_ici` dans `.env.local` par cette clé

### 2. Exécuter le Script SQL
1. Dans Supabase Dashboard, allez dans **SQL Editor**
2. Copiez-collez le contenu du fichier `supabase_settings_setup.sql`
3. Cliquez sur **Run** pour exécuter le script

### 3. Tester la Fonctionnalité
1. Redémarrez le serveur Next.js : `npm run dev`
2. Allez sur `/admin/dashboard`
3. Modifiez les paramètres généraux
4. Vérifiez que les changements sont sauvegardés et visibles sur la page d'accueil

## Ce que Fait le Script SQL

### Table Settings
- Crée la table `settings` avec les colonnes nécessaires
- Active RLS sur la table
- Crée des politiques pour les utilisateurs authentifiés

### Politiques RLS
- **Lecture** : Tous les utilisateurs authentifiés peuvent lire les paramètres
- **Écriture** : Tous les utilisateurs authentifiés peuvent modifier les paramètres

### Table Bookings
- Met à jour les politiques RLS pour permettre :
  - La création publique de réservations
  - La lecture publique des réservations
  - La modification/suppression par les utilisateurs authentifiés

### Index
- Ajoute des index pour améliorer les performances

## Dépannage

### Erreur "42501" (RLS violation)
- Vérifiez que le script SQL a été exécuté
- Vérifiez que la clé service role est correcte dans `.env.local`

### Paramètres ne se sauvegardent pas
- Vérifiez les logs de la console du navigateur
- Vérifiez que l'API route `/api/settings` répond correctement
- Vérifiez que la table `settings` existe dans Supabase

### Réservations ne se suppriment pas
- Vérifiez que les politiques RLS pour la table `bookings` sont correctes
- Assurez-vous d'être connecté en tant qu'admin

## Fichiers Modifiés
- `src/lib/useGeneralSettings.ts` - Utilise maintenant l'API route
- `src/app/api/settings/route.ts` - Nouvelle API route pour les paramètres
- `.env.local` - Ajout de la clé service role
- `supabase_settings_setup.sql` - Script de configuration de la base de données