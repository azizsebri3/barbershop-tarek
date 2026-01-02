# 🗓️ Guide Calendrier Admin - Elite Services

## 📋 État Actuel

✅ **Calendrier client moderne** - Système de réservation à 3 étapes avec React Calendar  
✅ **Interface admin FullCalendar** - Visualisation et gestion des RDV  
✅ **API de disponibilités** - Gestion backend des créneaux  
✅ **Modal de gestion** - Interface pour définir les disponibilités  

## 🗄️ Configuration Base de Données

### 1. Créer la table availability_slots

Exécutez ce script dans votre console SQL Supabase :

```sql
-- Table pour gérer les créneaux de disponibilité de l'admin
CREATE TABLE availability_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes par date
CREATE INDEX idx_availability_date ON availability_slots(date);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_availability_updated_at
    BEFORE UPDATE ON availability_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Politique RLS (Row Level Security)
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture publique pour les disponibilités
CREATE POLICY "Allow public read access" ON availability_slots
    FOR SELECT USING (true);

-- Politique : Modifications admin
CREATE POLICY "Allow admin modifications" ON availability_slots
    FOR ALL USING (true);
```

### 2. Vérifier les permissions

Assurez-vous que votre `SUPABASE_SERVICE_ROLE_KEY` est bien configurée dans `.env.local`.

## 🚀 Fonctionnalités Implémentées

### Pour les Clients
- **Calendrier moderne** : Sélection visuelle de la date
- **Créneaux horaires** : Affichage des disponibilités en temps réel
- **Réservation simple** : Processus en 3 étapes (service → date → heure)
- **Feedback visuel** : Animations et confirmations

### Pour l'Admin
- **Calendrier FullCalendar** : Vue mensuelle, hebdomadaire, journalière
- **Gestion des RDV** : Confirmer/Annuler les réservations
- **Disponibilités** : Définir les créneaux disponibles
- **Statistiques** : Aperçu des réservations

## 🎯 Utilisation

### Accès Client
```
http://localhost:3000/booking
```
- Interface moderne avec calendrier visuel
- Sélection de service puis de créneau
- Formulaire de contact intégré

### Accès Admin
```
http://localhost:3000/admin/calendar
```
- Authentification requise (vérifiez admin-auth.ts)
- Vue complète du planning
- Gestion interactive des disponibilités

## ⚙️ Configuration

### Personnalisation des Horaires
Modifiez dans `AdminCalendar.tsx` :
```typescript
businessHours={{
  daysOfWeek: [1, 2, 3, 4, 5, 6], // Lundi à Samedi
  startTime: '09:00',
  endTime: '18:00'
}}
```

### Créneaux par Défaut
Dans `CalendarBooking.tsx`, ajustez :
```typescript
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30',
  // ... vos créneaux
]
```

## 🧪 Tests

### 1. Test Réservation Client
1. Allez sur `/booking`
2. Sélectionnez un service
3. Choisissez une date et heure
4. Remplissez le formulaire
5. Vérifiez dans `/admin/calendar`

### 2. Test Gestion Admin
1. Accédez à `/admin/calendar`
2. Cliquez sur une date pour définir la disponibilité
3. Configurez les créneaux (toute la journée ou heures spécifiques)
4. Vérifiez l'affichage côté client

### 3. Test API
```bash
# Lister les disponibilités
curl "http://localhost:3000/api/availability?startDate=2024-12-01&endDate=2024-12-31"

# Créer une disponibilité
curl -X POST "http://localhost:3000/api/availability" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-12-15",
    "start_time": "09:00",
    "end_time": "17:00",
    "is_available": true,
    "is_all_day": false
  }'
```

## 🔧 Dépannage

### Erreurs Communes

1. **Table n'existe pas**
   - Exécutez le script SQL dans Supabase
   - Vérifiez les permissions RLS

2. **Calendrier ne s'affiche pas**
   - Vérifiez les imports FullCalendar
   - Contrôlez la console pour les erreurs CSS

3. **API ne répond pas**
   - Vérifiez `.env.local`
   - Testez la connexion Supabase

### Performance

- Les disponibilités sont chargées par période de 60 jours
- Système de fallback avec créneaux par défaut
- Cache local pour réduire les appels API

## 📁 Fichiers Importants

- `/src/components/admin/AdminCalendar.tsx` - Interface admin principale
- `/src/components/CalendarBooking.tsx` - Interface client
- `/src/app/api/availability/` - API de gestion des disponibilités
- `/supabase/create_availability_table_fixed.sql` - Script de création de table

## 🎨 Styles

Le calendrier utilise des styles personnalisés pour s'intégrer au thème sombre :
- Couleurs adaptées au design Elite Services
- Animations Framer Motion
- Interface responsive

## 🔜 Améliorations Possibles

- [ ] Drag & drop pour modifier les RDV
- [ ] Récurrence pour les disponibilités (ex: tous les mardis)
- [ ] Notifications en temps réel
- [ ] Export des plannings
- [ ] Gestion des congés/vacances
- [ ] Intégration calendrier externe (Google Calendar)

---

**Status** : ✅ Fonctionnel - Prêt pour les tests  
**Dernière mise à jour** : Décembre 2024