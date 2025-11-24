# ThermoGain

Une application moderne de simulation financière pour les projets de pompes à chaleur (PAC), construite avec Next.js 16, TypeScript, Shadcn/ui, Prisma et NextAuth.js.

ThermoGain permet aux utilisateurs de créer des projets de remplacement de chauffage par une pompe à chaleur, d'estimer les économies d'énergie et de calculer la rentabilité financière sur plusieurs années.

## Fonctionnalités

### Wizard de Création de Projet (7 étapes)
1. **Logement** - Informations sur le logement (surface, isolation, code postal, etc.)
2. **Chauffage Actuel** - Type d'installation, consommation, coûts énergétiques
3. **Projet PAC** - Configuration de la pompe à chaleur (type, puissance, COP, émetteurs)
4. **Coûts** - Coûts de la PAC, installation et travaux annexes
5. **Aides** - MaPrimeRénov', CEE, autres aides financières
6. **Financement** - Mode de financement (comptant, crédit, location)
7. **Évolutions** - Taux d'évolution des prix des énergies sur 10 ans

### Calculs Intelligents
- **Estimation de consommation** basée sur les caractéristiques du logement (méthode DPE)
- **Ajustement par zone climatique** (H1, H2, H3) selon le code postal
- **Calcul de COP ajusté** selon la température de départ et la zone climatique
- **Simulation financière** sur 10-20 ans avec actualisation
- **Cache des prix énergétiques** mis à jour via l'API DIDO du gouvernement

### Gestion de Projets
- Dashboard avec liste des projets
- Statut de complétion des projets
- Édition et suppression de projets
- Gestion multi-utilisateurs avec authentification

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript
- **UI**: Shadcn/ui + Tailwind CSS v4
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: NextAuth.js v5
- **ORM**: Prisma
- **Deployment**: Vercel
- **APIs**: DIDO (données énergétiques gouvernementales)

## Getting Started

### 1. Clone and install dependencies

```bash
npm install
```

### 2. Setup Neon Database

1. Create a database on [Neon](https://console.neon.tech)
2. Copy your connection string
3. Update the `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"
```

### 3. Generate NextAuth secret

```bash
openssl rand -base64 32
```

Add it to your `.env` file:

```env
NEXTAUTH_SECRET="your-generated-secret"
```

### 4. Run database migrations

```bash
npx prisma db push
```

### 5. Seed the database with a test user

```bash
npm run db:seed
```

This will create a test user:
- **Email**: `admin@thermogain.com`
- **Password**: `admin123`

⚠️ Change the password after first login!

### 6. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
thermogain/
├── app/                                    # Next.js 16 App Router
│   ├── (auth)/                            # Auth route group
│   │   ├── login/                         # Login page
│   │   └── layout.tsx                     # Auth layout
│   ├── (main)/                            # Protected routes group
│   │   ├── page.tsx                       # Dashboard/Home
│   │   ├── projects/                      # Projects management
│   │   │   ├── page.tsx                   # Projects list
│   │   │   ├── [id]/                      # Project details
│   │   │   └── new/[projectId]/[step]/    # 7-step wizard
│   │   │       ├── page.tsx               # Step container
│   │   │       └── sections/              # Step sections
│   │   │           ├── housing/           # Étape 1: Logement
│   │   │           ├── currentHeating/    # Étape 2: Chauffage actuel
│   │   │           ├── heatPumpProject/   # Étape 3: Projet PAC
│   │   │           ├── costs/             # Étape 4: Coûts
│   │   │           ├── financialAid/      # Étape 5: Aides
│   │   │           ├── financing/         # Étape 6: Financement
│   │   │           └── evolutions/        # Étape 7: Évolutions
│   │   └── layout.tsx                     # Main layout with nav
│   ├── api/auth/                          # NextAuth API routes
│   ├── layout.tsx                         # Root layout
│   └── globals.css                        # Global styles
├── components/                             # React components
│   └── ui/                                # Shadcn/ui components
├── lib/                                    # Utilities and configurations
│   ├── auth.ts                            # NextAuth configuration
│   ├── prisma.ts                          # Prisma client
│   ├── consumptionEstimation.ts           # Estimation consommation (DPE)
│   ├── climateZones.ts                    # Zones climatiques H1/H2/H3
│   ├── copAdjustments.ts                  # Ajustements COP
│   ├── boilerEfficiency.ts                # Rendements chaudières
│   ├── loanCalculations.ts                # Calculs de crédit
│   ├── energyPriceCache.ts                # Cache prix énergies
│   ├── didoApi.ts                         # API gouvernementale DIDO
│   ├── wizardSteps.ts                     # Configuration wizard
│   ├── actions/                           # Server actions
│   │   ├── projects.ts                    # Actions projets
│   │   ├── energyPrices.ts                # Actions prix énergies
│   │   └── auth.ts                        # Actions auth
│   └── utils.ts                           # Utility functions
├── prisma/
│   ├── schema.prisma                      # Database schema
│   └── seed.ts                            # Database seeding
└── .env                                   # Environment variables
```

### Architecture

#### Route Groups
Next.js 16 uses **route groups** (folders in parentheses) to organize routes without affecting the URL:

- `(auth)` - Pages d'authentification avec style personnalisé
- `(main)` - Pages protégées avec vérification d'authentification et navigation

#### Wizard Multi-étapes
Le wizard de création de projet utilise une architecture modulaire:
- **7 sections indépendantes** avec leurs propres schemas Zod, actions serveur et composants
- **Navigation dynamique** avec validation à chaque étape
- **Sauvegarde automatique** des données dans la base de données
- **Progression trackée** via `currentStep` dans le modèle Project

#### Modèles de Données
- `Project` - Projet principal avec métadonnées
- `ProjectLogement` - Données du logement (étape 1)
- `ProjectChauffageActuel` - Données du chauffage actuel (étape 2)
- `ProjectProjetPac` - Configuration de la PAC (étape 3)
- `ProjectCouts` - Coûts du projet (étape 4)
- `ProjectAides` - Aides financières (étape 5)
- `ProjectFinancement` - Mode de financement (étape 6)
- `ProjectEvolutions` - Évolutions des prix énergies (étape 7)
- `EnergyPriceCache` - Cache des prix énergétiques

## Available Scripts

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Compiler pour la production
- `npm start` - Démarrer le serveur de production
- `npm run lint` - Lancer ESLint
- `npm run db:seed` - Créer un utilisateur de test dans la base de données
- `npx prisma studio` - Ouvrir Prisma Studio (interface graphique pour la base de données)
- `npx prisma generate` - Générer le client Prisma
- `npx prisma db push` - Pousser les changements du schéma vers la base de données

## Base de Données

### Modèles Principaux

- **User** - Utilisateurs de l'application
- **Project** - Projets de pompes à chaleur avec 7 relations pour chaque étape
- **EnergyPriceCache** - Cache des prix énergétiques mis à jour via l'API DIDO

### Mise à Jour des Prix Énergétiques

Les prix énergétiques (fioul, gaz, GPL, bois, électricité) sont mis à jour automatiquement via l'API DIDO du gouvernement:

```typescript
// Dans lib/actions/energyPrices.ts
import { updateEnergyPricesFromDido } from '@/lib/energyPriceCache'

// Mise à jour manuelle
await updateEnergyPricesFromDido()
```

Les prix sont stockés dans la table `EnergyPriceCache` avec:
- Prix moyen actuel (€/kWh ou €/L)
- Évolution sur 10 ans (%/an)
- Date de dernière mise à jour

## Authentification

L'application utilise NextAuth.js v5 avec:
- Provider Credentials (email/password)
- Adapter Prisma pour les sessions en base de données
- Stratégie JWT

### Utilisateur de Test

Après avoir exécuté `npm run db:seed`, vous pouvez vous connecter avec:
- **Email**: admin@thermogain.com
- **Password**: admin123

⚠️ **Important**: Changez le mot de passe après la première connexion!

## Déploiement sur Vercel

1. Poussez votre code sur GitHub
2. Importez votre repository sur [Vercel](https://vercel.com)
3. Ajoutez les variables d'environnement dans le dashboard Vercel:
   - `DATABASE_URL` - Votre chaîne de connexion Neon poolée
   - `DIRECT_URL` - Votre chaîne de connexion Neon directe
   - `NEXTAUTH_SECRET` - Secret généré (utilisez `openssl rand -base64 32`)
   - `NEXTAUTH_URL` - L'URL de votre déploiement Vercel (ex: `https://votre-app.vercel.app`)
4. Déployez

Vercel va automatiquement:
- Détecter Next.js et configurer le build
- Exécuter `prisma generate` via le script postinstall
- Compiler avec Turbopack

Après le déploiement, exécutez le script de seed pour créer un utilisateur de test:
```bash
# Dans la console Vercel ou localement avec la DATABASE_URL de production
npm run db:seed
```

## Méthodologie de Calcul

### Estimation de Consommation Énergétique
ThermoGain utilise la **méthode 3CL-DPE 2021** (Calcul des Consommations Conventionnelles des Logements - Diagnostic de Performance Énergétique):

- **Coefficient de base** selon l'année de construction et la réglementation thermique (RT 1974, RT 2000, RT 2005, RT 2012)
- **Ajustement par isolation** (Mauvaise/Moyenne/Bonne)
- **Ajustement climatique** par zone H1/H2/H3 selon le code postal
- **Facteur d'occupation** selon le nombre d'occupants

### Calcul du COP (Coefficient de Performance)
Le COP de la PAC est ajusté selon:
- **Température de départ** de l'eau de chauffage
- **Zone climatique** (H1/H2/H3)
- **Type d'émetteurs** (radiateurs haute/basse température, plancher chauffant, ventilo-convecteurs)

### Rendement des Installations Existantes
Le rendement du chauffage actuel est ajusté selon:
- **Âge de l'installation** (perte de rendement progressive)
- **État de l'installation** (Bon/Moyen/Mauvais)
- **Type de système** (rendements différents par énergie)

### Simulation Financière
- Calcul des **économies annuelles** sur 10-20 ans
- Prise en compte de l'**évolution des prix énergétiques** (données gouvernementales)
- Calcul du **Temps de Retour sur Investissement (TRI)**
- **Actualisation** des flux financiers futurs
- Intégration des **aides financières** (MaPrimeRénov', CEE, etc.)
- Calcul des **mensualités de crédit** avec intérêts

## Sources de Données

- **API DIDO** - Données énergétiques officielles du gouvernement français
- **Méthode 3CL-DPE 2021** - Calcul des consommations conventionnelles des logements
- **Réglementations thermiques** - RT 1974, RT 2000, RT 2005, RT 2012
- **Zones climatiques** - Classification H1/H2/H3 selon le code postal

## En Savoir Plus

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [Neon Documentation](https://neon.tech/docs)
- [API DIDO](https://data.statistiques.developpement-durable.gouv.fr/)
- [Méthode 3CL-DPE 2021](https://www.ecologie.gouv.fr/diagnostic-performance-energetique-dpe)
