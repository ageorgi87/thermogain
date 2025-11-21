# Instructions de Migration de la Base de Données

## Problème
La base de données contient encore l'ancien schéma avec :
- L'ancien modèle `Project` (avec description, textField, etc.)
- L'ancien modèle `HeatingProject` et ses relations

Le nouveau schéma a :
- Un seul modèle `Project` (ancien HeatingProject renommé)
- `ProjectLogement` avec `code_postal` au lieu de `departement`
- Plus de colonne `description` dans Project

## Solution

### Option 1 : Migration propre (RECOMMANDÉ si vous avez des données à conserver)

1. **Créer une migration Prisma :**
   ```bash
   npx prisma migrate dev --name rename_heating_project_to_project
   ```

   Cette commande va :
   - Analyser les différences entre le schéma actuel et la base de données
   - Générer un fichier de migration SQL
   - Vous permettre de vérifier les changements avant de les appliquer

2. **Appliquer la migration en production :**
   ```bash
   npx prisma migrate deploy
   ```

### Option 2 : Reset complet (Si vous n'avez PAS de données à conserver)

1. **Réinitialiser complètement la base de données :**
   ```bash
   npx prisma db push --force-reset
   ```

   ⚠️ **ATTENTION** : Cette commande supprime TOUTES les données !

### Option 3 : Migration manuelle

Si vous préférez contrôler manuellement les changements SQL :

```sql
-- 1. Supprimer l'ancien modèle Project
DROP TABLE IF EXISTS "Project" CASCADE;

-- 2. Renommer HeatingProject en Project
ALTER TABLE "HeatingProject" RENAME TO "Project";

-- 3. Renommer les colonnes heatingProjectId en projectId
ALTER TABLE "HeatingProjectLogement" RENAME COLUMN "heatingProjectId" TO "projectId";
ALTER TABLE "HeatingProjectChauffageActuel" RENAME COLUMN "heatingProjectId" TO "projectId";
ALTER TABLE "HeatingProjectConsommation" RENAME COLUMN "heatingProjectId" TO "projectId";
ALTER TABLE "HeatingProjectProjetPac" RENAME COLUMN "heatingProjectId" TO "projectId";
ALTER TABLE "HeatingProjectCouts" RENAME COLUMN "heatingProjectId" TO "projectId";
ALTER TABLE "HeatingProjectAides" RENAME COLUMN "heatingProjectId" TO "projectId";
ALTER TABLE "HeatingProjectFinancement" RENAME COLUMN "heatingProjectId" TO "projectId";
ALTER TABLE "HeatingProjectEvolutions" RENAME COLUMN "heatingProjectId" TO "projectId";

-- 4. Renommer les tables des sections
ALTER TABLE "HeatingProjectLogement" RENAME TO "ProjectLogement";
ALTER TABLE "HeatingProjectChauffageActuel" RENAME TO "ProjectChauffageActuel";
ALTER TABLE "HeatingProjectConsommation" RENAME TO "ProjectConsommation";
ALTER TABLE "HeatingProjectProjetPac" RENAME TO "ProjectProjetPac";
ALTER TABLE "HeatingProjectCouts" RENAME TO "ProjectCouts";
ALTER TABLE "HeatingProjectAides" RENAME TO "ProjectAides";
ALTER TABLE "HeatingProjectFinancement" RENAME TO "ProjectFinancement";
ALTER TABLE "HeatingProjectEvolutions" RENAME TO "ProjectEvolutions";

-- 5. Renommer la colonne departement en code_postal dans ProjectLogement
ALTER TABLE "ProjectLogement" RENAME COLUMN "departement" TO "code_postal";

-- 6. Mettre à jour la relation dans User
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_projects_fkey";
-- La nouvelle contrainte sera créée automatiquement par Prisma
```

## Après la migration

1. **Régénérer le client Prisma :**
   ```bash
   npx prisma generate
   ```

2. **Vérifier que tout fonctionne :**
   ```bash
   npm run build
   ```

## Changements de schéma principaux

### Supprimé :
- Ancien modèle `Project` (avec description, textField, numberField, etc.)

### Renommé :
- `HeatingProject` → `Project`
- `HeatingProjectLogement` → `ProjectLogement`
- `HeatingProjectChauffageActuel` → `ProjectChauffageActuel`
- `HeatingProjectConsommation` → `ProjectConsommation`
- `HeatingProjectProjetPac` → `ProjectProjetPac`
- `HeatingProjectCouts` → `ProjectCouts`
- `HeatingProjectAides` → `ProjectAides`
- `HeatingProjectFinancement` → `ProjectFinancement`
- `HeatingProjectEvolutions` → `ProjectEvolutions`
- Tous les champs `heatingProjectId` → `projectId`
- Dans ProjectLogement : `departement` → `code_postal`

### Modifié :
- Relation dans User : `heatingProjects` → `projects`
