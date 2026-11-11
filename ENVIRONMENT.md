# 📋 Configuration des Variables d'Environnement

Ce fichier explique comment configurer toutes les variables nécessaires pour faire fonctionner le projet.

## 📌 Variables Requises

Votre fichier `.env.local` doit contenir ces variables :

```env
# Supabase Configuration (REQUIS)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL de Base (REQUIS EN PRODUCTION)
# Important: définir en production pour les emails de réinitialisation
NEXT_PUBLIC_BASE_URL=https://votre-domaine.com

# Avis Google (server-side uniquement)
GOOGLE_PLACES_API_KEY=votre_cle_google_places
GOOGLE_PLACE_ID=votre_place_id_google

# Réservation Salonkee (OPTIONNEL jusqu'à réception du lien)
# URL publique fournie par Salonkee pour la réservation de Tarek
NEXT_PUBLIC_SALONKEE_BOOKING_URL=https://salonkee.com/...

# Email Configuration (OPTIONNEL)
SMTP_HOST=smtp.votre-domaine.com
SMTP_PORT=587
SMTP_USER=votre-email@example.com
SMTP_PASSWORD=votre-mot-de-passe
EMAIL_FROM=noreply@example.com
```

### Session administrateur

Configurez la variable serveur `JWT_SECRET` avec une valeur aléatoire unique
d'au moins 32 octets dans `.env.local` et dans chaque environnement de
déploiement. Ne la publiez pas et n'utilisez pas le préfixe `NEXT_PUBLIC_`.
Vous pouvez générer une valeur avec :

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Modifier cette clé déconnecte les sessions existantes. Les anciens cookies non
signés ne sont plus acceptés : les administrateurs devront se reconnecter.

### Liens de modification de rendez-vous

Configurez aussi `BOOKING_LINK_SECRET` avec une clé aléatoire distincte d'au
moins 32 octets dans chaque environnement, sans préfixe `NEXT_PUBLIC_`. Les
nouveaux e-mails contiennent un lien signé valable un an. Les anciens liens non
signés ne fonctionnent plus : le salon doit renvoyer un nouveau lien.
Changer la clé invalide tous les liens précédents. Si la clé est absente,
l'e-mail est envoyé sans lien de modification et l'erreur est enregistrée.
Les tables `availability_slots`, `blocked_time_slots` et la colonne
`bookings.duration_minutes` doivent exister pour vérifier les disponibilités.

### Notifications push administrateur

Configurer `NEXT_PUBLIC_VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` ainsi que la
table `push_subscriptions`. Chaque appareil administrateur doit autoriser les
notifications et être abonné depuis l'administration. Les nouvelles réservations
(y compris celles créées manuellement), les annulations et les déplacements
effectués par le client déclenchent une push. Les changements effectués par
Tarek ne déclenchent pas de push d'annulation ou de déplacement.

La push affiche le nom, le service et l'horaire ; pour un déplacement, elle
affiche l'ancien et le nouvel horaire. Elle n'inclut pas la raison d'annulation.
Une erreur d'envoi est journalisée et ne revient pas sur la réservation ; la
livraison dépend du navigateur et du système de notifications de l'appareil.

### Langue de réservation

L'agenda affiche la langue enregistrée avec le rendez-vous, et non une garantie
de la langue parlée par le client. Vérifiez que la colonne `bookings.language`
existe ; le script `supabase/add_booking_language.sql` permet de l'ajouter
si nécessaire. Sans cette colonne, le site accepte encore les réservations,
mais l'agenda affiche « Not recorded » et les e-mails ultérieurs utilisent
le français par défaut. Le script attribue `fr` aux anciennes réservations ;
les rendez-vous créés manuellement utilisent aussi le français par défaut.
Ces valeurs ne prouvent donc pas la langue choisie par le client.

### Vue du jour et historique client

La vue **Today** utilise le fuseau Europe/Brussels et les disponibilités de
l'agenda. Les plages affichées sont calculées par intervalles de 15 minutes ;
elles ne garantissent pas qu'une prestation plus longue puisse y tenir.
Après le début d'un rendez-vous confirmé, l'administrateur peut marquer la
visite terminée ou le client absent, puis corriger ou retirer ce statut.
Ce statut ne change pas la confirmation ni l'occupation du créneau.

La migration `supabase/migrations/20261110_visit_outcomes_and_client_notes.sql`
ajoute un statut de visite facultatif et une table de notes privées protégée
par RLS, accessible uniquement par les routes administrateur. Les notes sont
regroupées par adresse e-mail normalisée ; des clients partageant une adresse
partagent donc la note. Les anciennes réservations restent inchangées et ne
sont comptées comme visites terminées qu'après une indication manuelle.
Vérifier et sauvegarder la base avant toute migration en production ; ne pas
réexécuter cette migration sans vérifier la contrainte existante.

### Boutique de produits

Exécutez la migration `supabase/migrations/20261108_products.sql` dans le projet
Supabase avant d'utiliser la boutique. Elle crée la table `products` protégée
par RLS et le bucket public `product-photos` (les écritures passent par les
routes serveur protégées par la session administrateur).

Dans l'administration, **Products** permet de gérer les noms, descriptions,
prix, photos et stocks. L'anglais est obligatoire pour le nom ; les traductions
française et néerlandaise sont facultatives et remplacées par l'anglais si
elles sont absentes. Le stock est mis à jour manuellement par Tarek.
Un produit épuisé peut rester visible ou être masqué selon son réglage.

Le panier ouvre WhatsApp ou le logiciel d'e-mail avec un message préparé que le
client doit encore envoyer : il ne réserve pas le
stock, n'enregistre pas de commande et ne prélève aucun paiement. Tarek doit
confirmer la disponibilité ; paiement et retrait ont lieu au salon. WhatsApp
utilise le numéro du salon déjà configuré dans le site, et l'e-mail provient
des paramètres généraux. Les photos téléversées et ensuite remplacées ou
retirées ne sont pas supprimées automatiquement du stockage.
La suppression définitive d'un produit demande confirmation et ne supprime
pas non plus son image du stockage.

La boutique utilise les dépendances existantes du projet (Framer Motion,
Lucide, react-dropzone et Sharp) : aucun paquet supplémentaire n'est requis.
Le dépôt se prépare avec `npm install` si les dépendances ne sont pas encore
installées. L'onglet **Products** de l'administration permet de déposer une
photo, de modifier les traductions par onglet et d'ajuster rapidement le prix,
le stock ou la visibilité. Les photos sont redimensionnées sans recadrage ;
la progression indique l'envoi au serveur, puis le traitement et la sauvegarde.

### Avis Google

La section des témoignages affiche les avis publics de la fiche Google Business
via **Places API (New)**. Activez cette API dans Google Cloud, créez une clé
restreinte à cette API, puis renseignez `GOOGLE_PLACE_ID`. Le lien de la fiche
Google seul ne permet pas de récupérer automatiquement les avis.

## 📅 Connexion à Salonkee

Quand Salonkee aura activé la fiche de Tarek et fourni son lien de réservation :

1. Ajoutez ce lien dans `.env.local` sous `NEXT_PUBLIC_SALONKEE_BOOKING_URL`.
2. Ajoutez la même variable dans les variables d'environnement de Vercel (environnements **Production**, et **Preview** si nécessaire).
3. Relancez le déploiement.

Tous les boutons « Réserver » du site (accueil, menu, tarifs, services, pied de page et navigation mobile) utiliseront alors automatiquement Salonkee. Si la variable est vide, le formulaire de réservation interne reste disponible comme solution de repli.

## 🔑 Où Trouver les Clés Supabase

### 1. Project URL
- Allez sur https://supabase.com/dashboard
- Ouvrez votre projet
- Cliquez "Settings" (engrenage en bas à gauche)
- Allez dans "API"
- Copiez **Project URL**

### 2. Anon Public Key
- Même endroit que Project URL
- Copiez **anon public** (c'est NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Service Role Secret
- Même endroit
- Copiez **service_role secret** (gardez-le secret!)

## ✨ Variables Publiques vs Privées

### Variables Publiques (`NEXT_PUBLIC_`)
- Visibles côté client (navigateur)
- Peuvent être exposées (c'est normal)
- Utilisez les clés "anon" de Supabase

**Exemples:**
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Variables Privées
- Seulement côté serveur
- Ne pas exposer au client
- Utilisez les clés "service_role" ou secrets sensibles

**Exemples:**
```env
SUPABASE_SERVICE_ROLE_KEY=...
SMTP_PASSWORD=...
```

## 📧 Configuration Email (Optionnel)

Si vous voulez envoyer des confirmations par email, configurez l'une de ces options :

### Option 1: Resend (Recommandé pour commencer)

```bash
npm install resend
```

Configuration :
```env
RESEND_API_KEY=re_votre_cle_api
```

Les e-mails transactionnels utilisent Resend. Configurez aussi `RESEND_FROM_EMAIL`,
`NEXT_PUBLIC_SALON_NAME` et `NEXT_PUBLIC_SITE_URL` avec l'URL publique du site :
les liens de modification, d'annulation et de téléchargement du calendrier en
dépendent. L'adresse affichée provient des paramètres généraux du salon. Le
fichier `.ics` utilise le fuseau `Europe/Brussels` et inclut la durée lorsqu'elle
est connue.

Utilisation dans `src/app/api/bookings/route.ts` :
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@example.com',
  to: email,
  subject: 'Confirmation de réservation',
  html: '<h1>Merci!</h1>'
});
```

### Option 2: SendGrid

```bash
npm install @sendgrid/mail
```

Configuration :
```env
SENDGRID_API_KEY=SG.votre_cle_api
```

### Option 3: Nodemailer (Gmail)

```bash
npm install nodemailer
```

Configuration :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app
EMAIL_FROM=votre-email@gmail.com
```

## 🛡️ Sécurité

### ⚠️ NE PAS faire :
```
❌ Pas de clés dans git
❌ Pas de secrets dans le code
❌ Pas de partage de .env.local
```

### ✅ À faire :
```
✅ Ajouter .env.local au .gitignore (déjà fait)
✅ Utiliser .env.local.example comme template
✅ Copier .env.local.example en .env.local et remplir
✅ Changer les secrets régulièrement
```

## 📝 Fichier .env.local.example

Vous trouverez un fichier `.env.local.example` à la racine du projet.
Pour l'utiliser :

```bash
# Copier le fichier
cp .env.local.example .env.local

# Ou sur Windows
copy .env.local.example .env.local

# Puis éditez .env.local avec vos vraies clés
```

## 🚀 Déploiement

Quand vous déployez sur Vercel, Netlify, etc., vous devez aussi configurer les variables d'environnement là-bas.

### Vercel
1. Allez dans Project Settings
2. Allez dans "Environment Variables"
3. Ajoutez chaque variable
4. Cliquez "Save" et "Redeploy"

### Netlify
1. Allez dans Site Settings
2. Allez dans "Build & Deploy" > "Environment"
3. Cliquez "Edit variables"
4. Ajoutez vos variables
5. Déclenchez un nouveau deploy

## ✅ Vérifier que Tout Fonctionne

```bash
# Démarrer le serveur
npm run dev

# Aller à http://localhost:3000/booking
# Remplir et soumettre le formulaire
# Vérifier que les données apparaissent dans Supabase
```

Si vous voyez des erreurs :
- Vérifiez que `.env.local` existe
- Vérifiez que les clés Supabase sont correctes
- Redémarrez le serveur (Ctrl+C puis npm run dev)

---

**Besoin d'aide ?** Consultez la [documentation Supabase](https://supabase.com/docs) !
