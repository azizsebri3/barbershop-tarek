# Documentation Dashboard Hybride - Supabase Realtime

## Vue d'ensemble

Le dashboard admin utilise un **système hybride** pour optimiser les performances :

- ✅ **Realtime** uniquement pour les **réservations** (table `bookings`)
- ❌ **Pas de realtime** pour : stats, chiffre d'affaires, historique clients, configuration

## Architecture

### 1. Hook Realtime (`useRealtimeBookings`)

**Fichier** : [`src/lib/useRealtimeBookings.ts`](src/lib/useRealtimeBookings.ts)

Hook personnalisé qui gère :
- Fetch initial des réservations
- Abonnement Supabase Realtime (INSERT, UPDATE, DELETE)
- Notifications toast automatiques
- Gestion de la déconnexion et fallback
- Cleanup automatique au unmount

**Utilisation** :
```tsx
const { 
  bookings, 
  loading, 
  isRealtimeConnected, 
  refetch 
} = useRealtimeBookings({
  enableNotifications: true,
  onInsert: (booking) => console.log('Nouvelle réservation'),
  onUpdate: (booking) => console.log('Réservation mise à jour'),
  onDelete: (id) => console.log('Réservation supprimée')
})
```

### 2. Intégration dans les composants

#### AdminBookings ([`src/components/admin/AdminBookingsNew.tsx`](src/components/admin/AdminBookingsNew.tsx))

**Changements** :
- ✅ Utilise `useRealtimeBookings` pour la gestion des réservations
- ✅ Suppression de `fetchBookings()` manuel
- ✅ Pas de mise à jour manuelle du state après CRUD (Realtime le fait)
- ✅ Indicateur de connexion Realtime (vert = connecté, orange = hors ligne)
- ✅ Bouton "Actualiser" pour refresh manuel si besoin

#### AdminCalendar ([`src/components/admin/AdminCalendar.tsx`](src/components/admin/AdminCalendar.tsx))

**Changements** :
- ✅ Utilise `useRealtimeBookings` pour les réservations
- ❌ Pas de realtime pour les disponibilités (fetch classique)
- ✅ Indicateur de connexion Realtime
- ✅ Mise à jour automatique du calendrier

### 3. Notifications

Le hook affiche automatiquement des notifications toast :

| Événement | Notification |
|-----------|-------------|
| **INSERT** | 🎉 Nouvelle réservation: [nom] |
| **UPDATE** | ✅/❌/⏳ Réservation mise à jour: [nom] |
| **DELETE** | 🗑️ Réservation supprimée |

**Personnalisation** :
```tsx
useRealtimeBookings({
  enableNotifications: false, // Désactiver les notifications
})
```

### 4. Gestion des erreurs et fallback

#### Connexion perdue
Si la connexion Realtime est perdue :
1. L'indicateur passe à "Hors ligne" (orange)
2. Un refetch automatique est déclenché
3. L'utilisateur peut utiliser le bouton "Actualiser" manuellement

#### Erreur de fetch
En cas d'erreur lors du chargement :
- Toast d'erreur affiché
- State `error` disponible dans le hook
- Callback `onError` appelé si défini

#### Cleanup
Le hook nettoie automatiquement :
- Désabonnement Realtime au unmount
- Arrêt des listeners
- Remise à zéro de l'état de connexion

## Supabase Configuration

### Realtime activé sur la table bookings

Assurez-vous que Realtime est activé dans Supabase :

```sql
-- Vérifier que Realtime est activé
SELECT * FROM pg_publication_tables WHERE tablename = 'bookings';

-- Si non activé, l'activer via le dashboard Supabase
-- Database > Replication > bookings (cocher)
```

### Politique de sécurité (RLS)

Les politiques RLS s'appliquent aussi aux événements Realtime :

```sql
-- Exemple : autoriser l'écoute des changements pour les admins
CREATE POLICY "Admin can listen to bookings"
ON bookings FOR SELECT
USING (auth.role() = 'authenticated');
```

## Performance

### Ce qui utilise Realtime
- ✅ AdminBookings (liste des réservations)
- ✅ AdminCalendar (événements du calendrier)

### Ce qui N'utilise PAS Realtime
- ❌ AdminDashboard (statistiques)
- ❌ Rapports/Analytics
- ❌ Configuration (services, prix, horaires)
- ❌ Galerie
- ❌ Disponibilités (availability table)

### Optimisations
- Abonnement créé **uniquement** quand le composant est monté
- Nettoyage automatique au démontage
- Pas de réabonnements inutiles (useRef)
- Notifications throttle si trop d'événements

## Tests

### Tester la connexion Realtime

1. Ouvrir le dashboard admin
2. Vérifier l'indicateur "Live" (vert)
3. Créer une réservation depuis le front public
4. ➡️ Le dashboard doit se mettre à jour instantanément

### Tester le fallback

1. Couper le réseau (mode avion)
2. L'indicateur passe à "Hors ligne"
3. Rétablir le réseau
4. ➡️ Les données se rechargent automatiquement

### Debug

Activer les logs dans la console :
```tsx
useRealtimeBookings({
  onInsert: (b) => console.log('🆕 INSERT:', b),
  onUpdate: (b) => console.log('🔄 UPDATE:', b),
  onDelete: (id) => console.log('🗑️ DELETE:', id),
  onError: (err) => console.error('❌ ERROR:', err)
})
```

## Migration depuis l'ancien système

### Avant (fetch manuel)
```tsx
const [bookings, setBookings] = useState([])

useEffect(() => {
  fetchBookings()
}, [])

const fetchBookings = async () => {
  const { data } = await supabase.from('bookings').select('*')
  setBookings(data)
}

// Après update/delete
await updateBooking(id)
await fetchBookings() // Recharge manuelle
```

### Après (realtime)
```tsx
const { bookings, loading } = useRealtimeBookings()

// Après update/delete
await updateBooking(id)
// Pas besoin de recharger - Realtime met à jour automatiquement !
```

## Troubleshooting

### Les notifications ne s'affichent pas
- Vérifier que `enableNotifications: true`
- Vérifier que `react-hot-toast` est installé

### L'indicateur reste "Hors ligne"
- Vérifier la connexion Supabase
- Vérifier que Realtime est activé sur la table
- Vérifier les politiques RLS
- Vérifier les logs console (statut de connexion)

### Les événements ne sont pas reçus
- Vérifier que le channel est bien créé
- Vérifier la configuration `postgres_changes`
- Vérifier les logs Supabase (Dashboard > Logs)

### Memory leak / composant ne se démonte pas
- Le hook gère automatiquement le cleanup
- Vérifier qu'il n'y a pas de références circulaires
- Utiliser React DevTools pour vérifier le démontage

## Futur

Possibles améliorations :
- [ ] Ajouter un système de retry automatique
- [ ] Implémenter un cache local (IndexedDB)
- [ ] Ajouter des métriques de performance
- [ ] Support multi-tenant avec filtres sur les channels
- [ ] Compression des notifications (debounce)

---

**Dernière mise à jour** : Janvier 2026  
**Compatible avec** : Next.js 15, Supabase Realtime v2
