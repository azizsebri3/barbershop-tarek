# Guide d'activation Supabase Realtime

## Étape 1 : Activer Realtime sur la table bookings

### Via le Dashboard Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Sélectionner votre projet
3. Aller dans **Database** → **Replication**
4. Chercher la table **`bookings`**
5. Cocher la case pour activer Realtime

### Via SQL

```sql
-- Activer Realtime pour la table bookings
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
```

## Étape 2 : Vérifier les politiques RLS

Les événements Realtime respectent les Row Level Security (RLS). Il faut donc avoir une politique qui autorise la lecture.

### Vérifier les politiques existantes

```sql
SELECT * FROM pg_policies WHERE tablename = 'bookings';
```

### Ajouter une politique si nécessaire

```sql
-- Autoriser la lecture pour tous (à adapter selon vos besoins)
CREATE POLICY "Allow read for authenticated users"
ON bookings FOR SELECT
USING (auth.role() = 'authenticated');

-- OU pour les admins uniquement
CREATE POLICY "Allow read for admins"
ON bookings FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- OU pour tous (public) - ATTENTION : à utiliser avec précaution
CREATE POLICY "Allow public read"
ON bookings FOR SELECT
USING (true);
```

## Étape 3 : Tester la connexion Realtime

### Test manuel dans le Dashboard Supabase

1. Aller dans **Database** → **Replication**
2. Cliquer sur **Test**
3. Vérifier que vous recevez les événements

### Test dans votre application

Ouvrir la console développeur et chercher :

```
✅ Realtime connecté
📡 Realtime status: SUBSCRIBED
```

### Test complet

1. Ouvrir le dashboard admin
2. Vérifier l'indicateur **"Live"** (vert)
3. Dans un autre onglet, créer une réservation
4. ➡️ La réservation doit apparaître instantanément dans le dashboard

## Étape 4 : Variables d'environnement

Vérifier que votre `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

⚠️ **Important** : Utiliser la clé **ANON** (pas la SERVICE_ROLE) côté client pour Realtime.

## Dépannage

### L'indicateur reste "Hors ligne"

**Causes possibles** :
- Realtime non activé sur la table
- Politiques RLS trop restrictives
- Clé API incorrecte
- Problème de réseau/firewall

**Solutions** :
```bash
# 1. Vérifier l'activation Realtime
SELECT * FROM pg_publication_tables WHERE tablename = 'bookings';
# Doit retourner une ligne avec pubname = 'supabase_realtime'

# 2. Tester la connexion depuis la console
const { data, error } = await supabase
  .from('bookings')
  .select('*')
console.log(data, error)

# 3. Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'bookings';
```

### Les événements ne sont pas reçus

**Debug** :

Dans `useRealtimeBookings.ts`, activer les logs :

```typescript
.subscribe((status) => {
  console.log('📡 Realtime status:', status)
  console.log('📡 Channel state:', channel)
})
```

Vérifier dans la console :
- `SUBSCRIBED` = ✅ connecté
- `CLOSED` ou `CHANNEL_ERROR` = ❌ problème

### Quota Realtime dépassé

Supabase limite le nombre de connexions simultanées selon votre plan :

| Plan | Connexions |
|------|-----------|
| Free | 200 |
| Pro  | 500 |
| Team | 500+ |

**Solution** : 
- Limiter le nombre d'onglets ouverts
- Upgrade vers un plan supérieur
- Implémenter un système de partage de connexion

## Sécurité

### Bonnes pratiques

1. **Utiliser RLS** : Ne jamais exposer toutes les données
   ```sql
   -- Filtrer par user_id par exemple
   CREATE POLICY "Users see own bookings"
   ON bookings FOR SELECT
   USING (auth.uid() = user_id);
   ```

2. **Limiter les champs exposés** : Ne sélectionner que ce qui est nécessaire
   ```typescript
   .select('id, name, date, status') // Pas tout
   ```

3. **Valider côté serveur** : Ne jamais faire confiance au client
   - Vérifier les permissions dans les API routes
   - Valider les données avant insertion

4. **Rate limiting** : Limiter les actions pour éviter les abus
   ```typescript
   // Exemple dans votre API
   const isRateLimited = await checkRateLimit(userId)
   if (isRateLimited) return res.status(429).json(...)
   ```

## Performance

### Optimisations

1. **Filtrer au niveau du channel**
   ```typescript
   supabase
     .channel('bookings-changes')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'bookings',
       filter: 'status=eq.pending' // ✅ Filtrer côté serveur
     })
   ```

2. **Désactiver Realtime sur les gros tableaux**
   - Utiliser plutôt du polling (refetch toutes les X secondes)
   - Ou pagination

3. **Cleanup proper**
   - Le hook gère déjà le cleanup automatique
   - Vérifier avec React DevTools qu'il n'y a pas de fuites mémoire

## Ressources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Dernière mise à jour** : Janvier 2026
