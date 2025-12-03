# Guide d'Organisation du Schema Prisma - ThermoGain

> Bonnes pratiques pour organiser le schema Prisma en plusieurs fichiers

## 📋 Principes de segmentation

### 1. Organisation par domaine

Grouper les modèles liés par **domaine métier** plutôt que par type technique.

### 2. Nommage des fichiers

- **Nom descriptif** du domaine : `auth.prisma`, `projects.prisma`
- **Éviter** les noms génériques : ❌ `models.prisma`, ❌ `myschema.prisma`
- **Un fichier principal** : `base.prisma` ou `main.prisma` pour la config

### 3. Relations cross-file

Les modèles peuvent se référencer entre fichiers **sans imports explicites**.

```prisma
// auth.prisma
model User {
  id String @id
  projects Project[] // Référence un modèle dans projects.prisma
}

// projects.prisma
model Project {
  userId String
  user User @relation(...) // Fonctionne automatiquement
}
```

---

## 🗂️ Structure actuelle pour ThermoGain

```
prisma/
├── schema/                       # Dossier principal (Prisma 5.15+)
│   ├── base.prisma              # Configuration (generator, datasource)
│   ├── users.prisma             # Utilisateurs et profils
│   ├── tokens.prisma            # Tokens de vérification et reset
│   ├── projects.prisma          # Projets PAC (entité principale)
│   ├── cache.prisma             # Cache API externe
│   └── sections/                # Sections détaillées des projets (7 fichiers)
│       ├── logement.prisma
│       ├── chauffageActuel.prisma
│       ├── projetPac.prisma
│       ├── couts.prisma
│       ├── aides.prisma
│       ├── financement.prisma
│       └── evolutions.prisma

```

---

## 📄 Contenu de chaque fichier

### `base.prisma`

Configuration globale du projet.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Pourquoi séparé ?**
- ✅ Fichier de référence évident
- ✅ Configuration centralisée
- ✅ Facilite les mises à jour

---

### `users.prisma`

Utilisateurs et informations de profil.

```prisma
// User Model - Core user entity and professional profile
// Stores user information, authentication data, and professional contact details

model User {
  id            String    @id @default(cuid())
  firstName     String?
  lastName      String?
  company       String?
  email         String    @unique
  emailVerified DateTime?
  password      String?

  // Relations
  projects Project[]

  // Professional contact information
  address    String?
  phone      String?
  city       String?
  postalCode String?
  website    String?
  siret      String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Domaine :** Gestion des utilisateurs et profils professionnels

**Note :** Les modèles NextAuth OAuth (Account, Session) ont été supprimés car l'application utilise une stratégie JWT sans OAuth.

---

### `tokens.prisma`

Tokens de vérification email et réinitialisation mot de passe.

```prisma
// Security Tokens - Email verification and password reset
// These tokens are temporary and expire after a certain time

// Email Verification Tokens
// Used during user registration to verify email ownership
model EmailVerificationToken {
  id      String   @id @default(cuid())
  email   String
  token   String   @unique
  expires DateTime

  createdAt DateTime @default(now())
}

// Password Reset Tokens
// Used when users request a password reset
model PasswordResetToken {
  id      String   @id @default(cuid())
  email   String
  token   String   @unique
  expires DateTime

  createdAt DateTime @default(now())
}
```

**Domaine :** Gestion des tokens de sécurité (email, password)

---

### `projects.prisma`

Entité principale des projets PAC.

```prisma
// Project - PAC Calculator (Heat Pump)
// Main entity for the multi-step wizard that calculates heat pump profitability
// Each project goes through 8 steps and stores detailed information in related tables

model Project {
  id              String   @id @default(cuid())
  name            String // Project name provided by user
  recipientEmails String[] @default([]) // Emails to send results to
  currentStep     Int      @default(1) // Track wizard progress (1-8)
  completed       Boolean  @default(false) // All steps completed

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Relations to section tables (one-to-one relationships)
  logement        ProjectLogement?
  chauffageActuel ProjectChauffageActuel?
  projetPac       ProjectProjetPac?
  couts           ProjectCouts?
  aides           ProjectAides?
  financement     ProjectFinancement?
  evolutions      ProjectEvolutions?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Domaine :** Projets de calculateur de pompe à chaleur (PAC)

---

### `sections/` (7 fichiers)

Les sections détaillées des projets ont été organisées dans un sous-dossier `sections/` pour une meilleure lisibilité.

Chaque section représente une étape du wizard multi-étapes :

#### `sections/logement.prisma`

Information sur le logement (étape 1).

```prisma
// Section 1: Logement (Housing Information)
// Stores basic property information collected in step 1 of the wizard

model ProjectLogement {
  id        String  @id @default(cuid())
  projectId String  @unique
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  code_postal        String
  annee_construction Int
  surface_habitable  Float
  nombre_occupants   Int
  qualite_isolation  String @default("Moyenne") // "Mauvaise", "Moyenne", "Bonne"

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### `sections/chauffageActuel.prisma`

Système de chauffage actuel et consommation (étape 2).

```prisma
// Section 2: Chauffage Actuel (Current Heating System)
// Stores information about the existing heating system and energy consumption

model ProjectChauffageActuel {
  id        String  @id @default(cuid())
  projectId String  @unique
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  type_chauffage    String
  age_installation  Int
  etat_installation String
  connait_consommation Boolean @default(true)

  // Consumption data - conditional based on type_chauffage and connait_consommation
  conso_fioul_litres Float?
  prix_fioul_litre   Float?
  conso_gaz_kwh      Float?
  prix_gaz_kwh       Float?
  conso_gpl_kg       Float?
  prix_gpl_kg        Float?
  conso_pellets_kg   Float?
  prix_pellets_kg    Float?
  conso_bois_steres  Float?
  prix_bois_stere    Float?
  conso_elec_kwh     Float?
  prix_elec_kwh      Float?
  cop_actuel         Float?
  conso_pac_kwh      Float?

  // Fixed costs and subscriptions (Novembre 2024)
  puissance_souscrite_actuelle Int @default(6)
  abonnement_gaz Float @default(120)
  entretien_annuel Float @default(120)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### `sections/projetPac.prisma`

Projet de pompe à chaleur (étape 3).

```prisma
// Section 3: Projet PAC (Heat Pump Project)
// Stores specifications for the planned heat pump installation

model ProjectProjetPac {
  id        String  @id @default(cuid())
  projectId String  @unique
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  type_pac           String
  puissance_pac_kw   Float
  cop_estime         Float
  temperature_depart Int?
  emetteurs          String?
  duree_vie_pac      Int @default(17)

  // Fixed costs and subscriptions (Novembre 2024)
  prix_elec_kwh                Float @default(0.2516)
  puissance_souscrite_actuelle Int   @default(6)
  puissance_souscrite_pac      Int   @default(9)
  entretien_pac_annuel         Float @default(120)
  prix_elec_pac                Float?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### `sections/couts.prisma`, `sections/aides.prisma`, `sections/financement.prisma`, `sections/evolutions.prisma`

Les 4 autres sections suivent le même modèle : un modèle par fichier, avec relation `onDelete: Cascade` vers `Project`.

**Domaine :** Sections détaillées du workflow de projet PAC (wizard multi-étapes)

**Pourquoi un sous-dossier `sections/` ?**
- ✅ Organisation hiérarchique claire : sépare les sections du reste du schema
- ✅ Navigation facilitée : toutes les sections au même endroit
- ✅ Forte cohésion : toutes dépendent de `Project`
- ✅ Relations en cascade : `onDelete: Cascade`
- ✅ Scalabilité : facile d'ajouter de nouvelles sections

---

### `cache.prisma`

Cache des données API externes.

```prisma
// Cache for DIDO API energy price data
// Stores current prices and evolution rates to avoid excessive API calls
// Data is cached per month and automatically refreshed when outdated
model EnergyPriceCache {
  id           String @id @default(cuid())
  energyType   String @unique // "fioul", "gaz", "gpl", "bois", "electricite"

  // Current price (average of last 12 months)
  currentPrice Float @default(0)

  // Evolution rate over 10 years (% per year)
  // Used for long-term investment calculations (17-year PAC lifespan)
  evolution_10y Float

  lastUpdated DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Domaine :** Cache des prix d'énergie (API DIDO)

---

## ✅ Avantages de cette structure

### 1. Clarté et maintenabilité

- **Domaines clairs** : Chaque fichier représente un domaine métier distinct
- **Navigation facile** : Trouver un modèle par son contexte fonctionnel
- **Isolation** : Les changements dans un domaine n'affectent pas les autres

### 2. Collaboration

- **Conflits Git réduits** : Plusieurs développeurs peuvent travailler sur des domaines différents
- **Revues de code facilitées** : Changements ciblés et contextualisés
- **Onboarding** : Nouveaux développeurs comprennent l'architecture plus rapidement

### 3. Scalabilité

- **Ajout de domaines** : Facile d'ajouter un nouveau fichier pour un nouveau domaine
- **Refactoring** : Modifier un domaine sans toucher aux autres
- **Tests** : Tester par domaine métier

---

## 🚀 Migration

### Étapes recommandées

1. **Vérifier la version Prisma** : Minimum 5.15.0
   ```bash
   npm list prisma @prisma/client
   ```

2. **Créer le dossier schema**
   ```bash
   mkdir prisma/schema
   ```

3. **Créer les nouveaux fichiers** dans `prisma/schema/`
   - Commencer par `base.prisma`
   - Ajouter les autres fichiers un par un

4. **Valider le schema**
   ```bash
   npx prisma validate
   npx prisma format
   ```

5. **Générer le client Prisma**
   ```bash
   npx prisma generate
   ```

6. **Tester l'application**
   - Vérifier que toutes les requêtes fonctionnent
   - Tester les relations cross-file

7. **Supprimer l'ancien fichier**
   ```bash
   rm prisma/schema.prisma
   ```

---

## ⚠️ Points d'attention

### 1. Version Prisma

- **Minimum requis** : Prisma 5.15.0+
- **Preview feature** : Activer `prismaSchemaFolder` (versions < 6.7.0)
- **Stable depuis** : v6.7.0 (juin 2025)

### 2. Commandes Prisma

Toutes les commandes Prisma fonctionnent automatiquement avec les fichiers multiples :
```bash
npx prisma generate    # Combine automatiquement tous les fichiers
npx prisma migrate dev # Fonctionne sur le schema complet
npx prisma validate    # Valide tous les fichiers
npx prisma format      # Formate tous les fichiers
npx prisma studio      # Visualise le schema complet
```

### 3. Relations

Les relations fonctionnent **automatiquement entre fichiers** sans imports :
- ✅ `User` dans `users.prisma` peut référencer `Project` dans `projects.prisma`
- ✅ Les contraintes de clés étrangères sont respectées
- ✅ Les cascades `onDelete: Cascade` fonctionnent normalement

### 4. Anti-patterns à éviter

❌ **Fichiers "fourre-tout"**
```
schema/
├── models.prisma      # ❌ Mélange tout
├── allModels.prisma   # ❌ Pas de séparation
```

❌ **Organisation par type technique**
```
schema/
├── ids.prisma         # ❌ Tous les modèles avec ID
├── timestamps.prisma  # ❌ Tous les modèles avec dates
```

✅ **Organisation par domaine métier**
```
schema/
├── users.prisma       # ✅ Utilisateurs
├── projects.prisma    # ✅ Projets PAC
├── sections/          # ✅ Sections de projets (hiérarchie)
│   ├── logement.prisma
│   └── ...
```

---

## 📚 Ressources

- [Prisma Multi-File Schema Documentation](https://www.prisma.io/blog/organize-your-prisma-schema-with-multi-file-support)
- [Prisma Schema Best Practices](https://www.prisma.io/docs/orm/prisma-schema/overview/introduction)
- [Discussion GitHub: Multiple Schema Files](https://github.com/prisma/prisma/discussions/20878)

---

**Dernière mise à jour** : 3 décembre 2024
