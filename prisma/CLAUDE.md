# Instructions Claude - Gestion du Schema Prisma

> Directives pour maintenir un schema Prisma propre, organisé et optimisé

## 🎯 Principes fondamentaux

### 1. Organisation du schema

**TOUJOURS** respecter l'organisation par domaine métier :
- ✅ Grouper les modèles par **domaine fonctionnel** (users, projects, tokens, etc.)
- ✅ Utiliser des **sous-dossiers** pour les groupes de modèles liés (ex: sections/)
- ❌ Ne JAMAIS organiser par type technique (ids.prisma, timestamps.prisma, etc.)

**Structure hiérarchique** :
```
prisma/schema/
├── base.prisma              # Configuration uniquement (generator, datasource)
├── [domain1].prisma         # Un domaine = un fichier
├── [domain2].prisma
└── [subdomain]/             # Sous-dossier pour modèles fortement liés
    ├── [model1].prisma
    └── [model2].prisma
```

### 2. Nommage des fichiers

- **Fichier de config** : `base.prisma` (contient UNIQUEMENT generator et datasource)
- **Domaines métier** : Nom descriptif du domaine au singulier (`users.prisma`, `projects.prisma`)
- **Sous-domaines** : Nom du modèle au singulier (`logement.prisma`, `financement.prisma`)
- ❌ **Éviter** : Noms génériques (`models.prisma`, `schema.prisma`, `data.prisma`)

### 3. Un modèle par fichier (recommandé)

Quand un domaine contient plusieurs modèles fortement liés :
- Si **faible cohésion** → Séparer en fichiers individuels
- Si **forte cohésion** → Regrouper dans un sous-dossier avec un modèle par fichier

**Exemple** : 7 sections de wizard → `sections/` avec 7 fichiers

## ⚠️ Règle critique : Champs inutilisés

### Vérification systématique

**AVANT toute modification du schema, TOUJOURS :**

1. **Analyser l'utilisation de TOUS les champs** du ou des modèles modifiés
2. **Rechercher dans TOUT le codebase** :
   - Requêtes Prisma (`prisma.[model].findUnique`, `.findMany`, etc.)
   - Sélections de champs (`select: { field: true }`)
   - Inclusions de relations (`include: { relation: true }`)
   - Types TypeScript qui référencent le modèle
   - Formulaires et validations (Zod, React Hook Form, etc.)
   - Calculs et logique métier
   - Templates email et affichage utilisateur

3. **Supprimer impitoyablement** tout champ qui n'est :
   - ❌ Jamais requis dans les queries
   - ❌ Jamais affiché à l'utilisateur
   - ❌ Jamais utilisé dans des calculs
   - ❌ Jamais référencé dans le code

## 🚫 Règle critique : Valeurs par défaut (@default)

### Principe absolu

**NE JAMAIS utiliser `@default()` sauf pour les valeurs générées automatiquement.**

### ✅ Valeurs par défaut AUTORISÉES (générées automatiquement)

**Uniquement** pour les valeurs que Prisma ou la base de données génèrent :

```prisma
model Example {
  id        String   @id @default(cuid())      // ✅ ID auto-généré
  createdAt DateTime @default(now())           // ✅ Timestamp auto-généré
  updatedAt DateTime @updatedAt                // ✅ Auto-update timestamp
  uuid      String   @default(uuid())          // ✅ UUID auto-généré
}
```

### ❌ Valeurs par défaut INTERDITES (valeurs métier)

**JAMAIS** pour des valeurs métier, même si elles semblent logiques :

```prisma
// ❌ INTERDIT : Valeurs métier avec @default
model ProjectProjetPac {
  duree_vie_pac        Int   @default(17)      // ❌ Champ REQUIS dans le formulaire
  prix_elec_kwh        Float @default(0.2516)  // ❌ API fournit le prix dynamique
  entretien_pac_annuel Float @default(120)     // ❌ Utilisateur doit entrer la valeur
  puissance_souscrite  Int   @default(6)       // ❌ Sauf si vraiment fallback technique
  abonnement_gaz       Float @default(120)     // ❌ Serveur set la valeur explicitement
}

// ✅ CORRECT : Pas de @default, logique dans le code
model ProjectProjetPac {
  duree_vie_pac        Int    // Form REQUIRED - user must enter
  prix_elec_kwh        Float  // API provides via useEffect
  entretien_pac_annuel Float  // Form REQUIRED - user must enter
  puissance_souscrite  Int    // Calculated from previous section
  abonnement_gaz       Float? // Server sets via GAS_SUBSCRIPTION constant
}
```

### Pourquoi cette règle ?

1. **Les defaults en DB sont trompeurs** :
   - Ils suggèrent que la DB gère la logique métier
   - Alors que c'est le **code applicatif** qui doit décider

2. **Les defaults deviennent obsolètes** :
   - Prix de l'électricité : 0.2516€ en 2024, mais 0.30€ en 2025 ?
   - Les constants dans le code sont plus faciles à mettre à jour

3. **Les defaults cachent les bugs** :
   - Si le formulaire oublie d'envoyer une valeur REQUISE
   - Le @default masque l'erreur au lieu de la révéler

4. **Les defaults court-circuitent la validation** :
   - Le formulaire dit "champ REQUIS"
   - Mais le @default permet de sauvegarder sans valeur
   - Incohérence entre UI et DB

### Où placer les valeurs par défaut ?

**Dans le code applicatif**, pas dans le schema :

```typescript
// ✅ Dans les constants
export const GAS_SUBSCRIPTION = {
  ANNUAL_AVERAGE: 120, // Moyenne nationale 2024
}

export const HEAT_PUMP_DEFAULTS = {
  LIFESPAN_YEARS: 17,        // Études ADEME
  MAINTENANCE_ANNUAL: 120,    // Coût moyen maintenance
}

// ✅ Dans les server actions
if (!data.abonnement_gaz && type === "Gaz" && !knowsConsumption) {
  validatedData.abonnement_gaz = GAS_SUBSCRIPTION.ANNUAL_AVERAGE
}

// ✅ Dans les useEffect
useEffect(() => {
  if (formData.prix_elec_kwh === undefined) {
    const price = await fetchCurrentElectricityPrice()
    updateField("prix_elec_kwh", price)
  }
}, [])
```

### Exception : Fallback technique

**UN SEUL cas acceptable** pour @default avec valeur métier :

```prisma
model ProjectProjetPac {
  // ⚠️ Exception : fallback quand donnée précédente indisponible
  puissance_souscrite_actuelle Int @default(6)
}
```

**Conditions pour garder un @default métier** :
1. ✅ La valeur est **normalement** fournie par une autre source (section précédente, API, calcul)
2. ✅ Le @default sert **uniquement de fallback technique** en cas d'erreur
3. ✅ Le commentaire **documente clairement** que c'est un fallback
4. ✅ Le @default est utilisé **rarement** en pratique (99% du temps, autre source fonctionne)

**Si ces 4 conditions ne sont PAS réunies → SUPPRIMER le @default**

### Processus de suppression

```typescript
// ❌ MAUVAIS : Garder des champs "au cas où"
model User {
  id String @id
  email String
  name String?        // Jamais affiché, jamais utilisé
  avatar String?      // Fonctionnalité pas implémentée
  settings Json?      // Prévu mais jamais codé
}

// ✅ BON : Seulement les champs réellement utilisés
model User {
  id String @id
  email String
  // Champs supprimés car inutilisés
}
```

**Étapes de vérification** :
1. Utiliser la recherche globale (Grep) pour chaque nom de champ
2. Vérifier les imports de types Prisma générés
3. Vérifier les formulaires et validations
4. Si aucune occurrence trouvée → **SUPPRIMER**

### Exceptions (garder le champ)

Ne supprimer un champ QUE s'il n'est PAS :
- ✅ Utilisé dans une relation Prisma (clé étrangère)
- ✅ Requis par une contrainte métier (email unique, timestamps)
- ✅ Présent dans les migrations existantes en production
- ✅ Utilisé dans des seeds ou scripts de données

## 📝 Commentaires et documentation

### Format des commentaires

**En-tête de fichier** (obligatoire) :
```prisma
// [Nom du domaine] - [Description courte]
// [Explication détaillée du rôle du ou des modèles]
```

**En-tête de modèle** (pour modèles complexes) :
```prisma
// [Nom du modèle]
// [Description de son rôle métier]
model Example { ... }
```

**Commentaires de champs** (si nécessaire) :
```prisma
// Explication du champ si non évident
field_name Type // Commentaire inline pour valeurs possibles
```

**Exemple complet** :
```prisma
// Section 3: Projet PAC (Heat Pump Project)
// Stores specifications for the planned heat pump installation

model ProjectProjetPac {
  id String @id @default(cuid())

  type_pac String // "Air/Air", "Air/Eau", "Eau/Eau"
  duree_vie_pac Int @default(17) // Estimated lifespan in years

  // Optional: only for water-based PACs
  temperature_depart Int?
  emetteurs String?
}
```

## 🔄 Relations cross-file

Les relations fonctionnent automatiquement entre fichiers **sans imports**.

```prisma
// users.prisma
model User {
  id String @id
  projects Project[] // Référence projects.prisma
}

// projects.prisma
model Project {
  id String @id
  userId String
  user User @relation(...) // Fonctionne automatiquement
}
```

**Règles** :
- ✅ Pas d'imports nécessaires
- ✅ Prisma combine automatiquement tous les fichiers
- ✅ Les contraintes FK et cascades fonctionnent normalement

## ✅ Checklist avant modification

Avant de modifier ou ajouter un fichier schema :

- [ ] Le fichier est-il organisé par **domaine métier** ?
- [ ] Le nom du fichier est-il **descriptif** et **au singulier** ?
- [ ] Les **commentaires d'en-tête** expliquent-ils le rôle du domaine ?
- [ ] Ai-je vérifié l'**utilisation de TOUS les champs** existants ?
- [ ] Ai-je **supprimé tous les champs inutilisés** ?
- [ ] Les **relations** sont-elles correctement définies ?
- [ ] Les **contraintes** (`@unique`, `onDelete`) sont-elles appropriées ?
- [ ] Les **valeurs par défaut** sont-elles documentées (commentaires) ?

## 🔍 Checklist après modification

Après chaque modification du schema :

- [ ] Valider le schema : `npx prisma validate --schema=prisma/schema`
- [ ] Formater les fichiers : `npx prisma format --schema=prisma/schema`
- [ ] Générer le client : `npx prisma generate --schema=prisma/schema`
- [ ] Tester le build : `npm run build`
- [ ] Vérifier que **aucune query n'est cassée** dans le codebase
- [ ] Mettre à jour `SCHEMA_ORGANIZATION_GUIDE.md` si architecture modifiée

## 🚫 Anti-patterns à éviter

### ❌ Fichiers "fourre-tout"
```
schema/
├── models.prisma      # Contient 15 modèles sans lien
├── everything.prisma  # Mélange users, projects, cache...
```

### ❌ Organisation technique
```
schema/
├── withTimestamps.prisma  # Tous les modèles avec createdAt/updatedAt
├── withRelations.prisma   # Tous les modèles avec relations
```

### ❌ Champs "au cas où"
```prisma
model User {
  // ❌ Fonctionnalité pas implémentée
  avatar String?
  preferences Json?
  notifications Boolean @default(true)
}
```

### ❌ Commentaires obsolètes
```prisma
model Project {
  // TODO: Ajouter validation - Commentaire vieux de 6 mois
  // FIXME: Ce champ ne devrait pas exister - Mais toujours là
  deprecated_field String?
}
```

## ✅ Bonnes pratiques

### ✅ Organisation claire
```
schema/
├── base.prisma        # Config uniquement
├── users.prisma       # Domaine users
├── tokens.prisma      # Domaine security
└── projects/          # Domaine projects avec sous-domaines
    ├── main.prisma
    └── sections/
```

### ✅ Champs documentés
```prisma
model ProjectProjetPac {
  // Electricity price (€/kWh) - REQUIRED
  // Necessary to calculate heat pump operating cost
  prix_elec_kwh Float @default(0.2516) // Average regulated tariff 2024
}
```

### ✅ Relations explicites
```prisma
model ProjectLogement {
  projectId String  @unique
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  // onDelete: Cascade documenté → suppression en cascade voulue
}
```

## 🛠️ Commandes utiles

```bash
# Valider le schema complet
npx prisma validate --schema=prisma/schema

# Formater tous les fichiers
npx prisma format --schema=prisma/schema

# Générer le client TypeScript
npx prisma generate --schema=prisma/schema

# Créer une migration
npx prisma migrate dev --schema=prisma/schema --name [description]

# Visualiser le schema
npx prisma studio --schema=prisma/schema

# Push vers DB sans migration (dev uniquement)
npx prisma db push --schema=prisma/schema
```

## 📚 Ressources

- [Prisma Multi-File Schema](https://www.prisma.io/blog/organize-your-prisma-schema-with-multi-file-support)
- [Prisma Best Practices](https://www.prisma.io/docs/orm/prisma-schema/overview/introduction)
- [SCHEMA_ORGANIZATION_GUIDE.md](./SCHEMA_ORGANIZATION_GUIDE.md) - Documentation spécifique au projet

---

**Version** : 1.0
**Dernière mise à jour** : 3 décembre 2024

**IMPORTANT** : Ces directives sont permanentes et s'appliquent à toute modification du schema Prisma, quelle que soit l'architecture actuelle du projet.
