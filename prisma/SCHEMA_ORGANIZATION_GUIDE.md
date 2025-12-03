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

## 🗂️ Structure proposée pour ThermoGain

```
prisma/
├── schema/                    # Nouveau dossier (Prisma 5.15+)
│   ├── base.prisma           # Configuration (generator, datasource)
│   ├── auth.prisma           # Authentification NextAuth
│   ├── users.prisma          # Utilisateurs et profils
│   ├── tokens.prisma         # Tokens de vérification et reset
│   ├── projects.prisma       # Projets PAC (entité principale)
│   ├── projectSections.prisma# Sections détaillées des projets
│   └── cache.prisma          # Cache API externe
└── schema.prisma             # ⚠️ À supprimer après migration

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

### `auth.prisma`

Modèles NextAuth.js (OAuth, sessions).

```prisma
// NextAuth.js Models - OAuth & Sessions
model Account {
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@id([identifier, token])
}
```

**Domaine :** Authentification OAuth et gestion de sessions

---

### `users.prisma`

Utilisateurs et informations de profil.

```prisma
// User model - Core user entity
model User {
  id            String    @id @default(cuid())
  name          String?
  firstName     String?
  lastName      String?
  company       String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?

  // Relations
  accounts Account[]
  sessions Session[]
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

---

### `tokens.prisma`

Tokens de vérification email et réinitialisation mot de passe.

```prisma
// Email Verification Tokens
model EmailVerificationToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime

  createdAt DateTime @default(now())
}

// Password Reset Tokens
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime

  createdAt DateTime @default(now())
}
```

**Domaine :** Gestion des tokens de sécurité (email, password)

---

### `projects.prisma`

Entité principale des projets PAC.

```prisma
// Project - PAC Calculator (Multi-step wizard)
model Project {
  id              String   @id @default(cuid())
  name            String
  recipientEmails String[] @default([])
  currentStep     Int      @default(1) // Track wizard progress (1-8)
  completed       Boolean  @default(false) // All steps completed

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Relations to section tables
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

### `projectSections.prisma`

Toutes les sections détaillées des projets (7 tables).

```prisma
// Section 1: Logement (Housing Information)
model ProjectLogement {
  id                 String  @id @default(cuid())
  projectId          String  @unique
  project            Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  code_postal        String
  annee_construction Int
  surface_habitable  Float
  nombre_occupants   Int
  qualite_isolation  String  @default("Moyenne")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Section 2: Chauffage Actuel (Current Heating System)
model ProjectChauffageActuel {
  id                           String  @id @default(cuid())
  projectId                    String  @unique
  project                      Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  type_chauffage               String
  age_installation             Int
  etat_installation            String
  connait_consommation         Boolean @default(true)

  // Consumption data (conditional)
  conso_fioul_litres           Float?
  prix_fioul_litre             Float?
  conso_gaz_kwh                Float?
  prix_gaz_kwh                 Float?
  conso_gpl_kg                 Float?
  prix_gpl_kg                  Float?
  conso_pellets_kg             Float?
  prix_pellets_kg              Float?
  conso_bois_steres            Float?
  prix_bois_stere              Float?
  conso_elec_kwh               Float?
  prix_elec_kwh                Float?
  cop_actuel                   Float?
  conso_pac_kwh                Float?

  // Fixed costs (Novembre 2024)
  puissance_souscrite_actuelle Int   @default(6)
  abonnement_gaz               Float @default(120)
  entretien_annuel             Float @default(120)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Section 3: Projet PAC (Heat Pump Project)
model ProjectProjetPac {
  id                           String  @id @default(cuid())
  projectId                    String  @unique
  project                      Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  type_pac                     String
  puissance_pac_kw             Float
  cop_estime                   Float
  temperature_depart           Int?
  emetteurs                    String?
  duree_vie_pac                Int     @default(17)

  // Electricity costs (Novembre 2024)
  prix_elec_kwh                Float @default(0.2516)
  puissance_souscrite_actuelle Int   @default(6)
  puissance_souscrite_pac      Int   @default(9)
  entretien_pac_annuel         Float @default(120)
  prix_elec_pac                Float?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Section 4: Coûts (Costs)
model ProjectCouts {
  id                   String  @id @default(cuid())
  projectId            String  @unique
  project              Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  cout_pac             Float
  cout_installation    Float
  cout_travaux_annexes Float
  cout_total           Float

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Section 5: Aides (Financial Aid)
model ProjectAides {
  id              String  @id @default(cuid())
  projectId       String  @unique
  project         Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  ma_prime_renov  Float
  cee             Float
  autres_aides    Float
  total_aides     Float

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Section 6: Financement (Financing)
model ProjectFinancement {
  id                String  @id @default(cuid())
  projectId         String  @unique
  project           Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  mode_financement  String
  apport_personnel  Float?
  montant_credit    Float?
  taux_interet      Float?
  duree_credit_mois Int?
  mensualite        Float?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Section 7: Évolutions (Price Evolution)
model ProjectEvolutions {
  id                         String  @id @default(cuid())
  projectId                  String  @unique
  project                    Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  evolution_prix_fioul       Float?
  evolution_prix_gaz         Float?
  evolution_prix_gpl         Float?
  evolution_prix_bois        Float?
  evolution_prix_electricite Float

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Domaine :** Sections détaillées du workflow de projet PAC (wizard multi-étapes)

**Pourquoi regroupé ?**
- ✅ Forte cohésion : toutes dépendent de `Project`
- ✅ Relations en cascade : `onDelete: Cascade`
- ✅ Utilisées ensemble dans le workflow

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
├── auth.prisma        # ✅ Authentification
├── projects.prisma    # ✅ Projets PAC
├── users.prisma       # ✅ Utilisateurs
```

---

## 📚 Ressources

- [Prisma Multi-File Schema Documentation](https://www.prisma.io/blog/organize-your-prisma-schema-with-multi-file-support)
- [Prisma Schema Best Practices](https://www.prisma.io/docs/orm/prisma-schema/overview/introduction)
- [Discussion GitHub: Multiple Schema Files](https://github.com/prisma/prisma/discussions/20878)

---

**Dernière mise à jour** : 3 décembre 2024
