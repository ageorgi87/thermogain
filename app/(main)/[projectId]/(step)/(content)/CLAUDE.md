# Architecture Step - Directives

> **IMPORTANT** : Ces directives s'appliquent à **CHAQUE** dossier présent dans `(step)/(content)/`
> Chaque step du wizard (chauffage-actuel, logement, projet-pac, etc.) doit suivre cette architecture strictement.

## 📁 Structure Globale

```
(step)/
├── hooks/                    # Hooks réutilisables (useStepForm)
├── components/               # Composants réutilisables (StepWrapper)
└── (content)/               # Contenu des steps
    └── nom-step/
        ├── actions/         # Server actions ("use server")
        ├── components/      # Composants React de la page
        ├── config/          # Configuration statique
        ├── lib/             # Logique métier (fonctions utilitaires)
        ├── queries/         # Queries Prisma optimisées
        ├── types/           # Types partagés (1 type = 1 fichier)
        └── page.tsx         # Page Next.js
```

## 📦 Infrastructure Partagée

### hooks/useStepForm.ts
Hook personnalisé qui abstrait la logique commune de tous les steps :
- State management (formData, errors, isSubmitting, isLoading)
- Chargement des données
- Validation Zod
- Sauvegarde et navigation
- Gestion des erreurs

### components/StepWrapper.tsx
Composant wrapper pour l'UI commune de tous les steps :
- Container et spacing
- Header avec titre et description
- Barre de progression
- Section explication dépliable
- Boutons de navigation (Précédent/Suivant)

## 🎯 Règles de Nommage

### Fichiers
- **.ts** → `camelCase.ts` (ex: `getDefaultEnergyPrices.ts`)
- **.tsx** → `PascalCase.tsx` (ex: `ChauffageActuelFields.tsx`)

### Fonctions
- **Format** : Arrow functions uniquement
```ts
// ✅ BON
export const myFunction = (params: Params): Result => {}

// ❌ INTERDIT
export function myFunction(params: Params): Result {}
```

### Paramètres
- **Règle** : Fonction avec params → Objet + Interface
```ts
// ✅ BON
interface GetDataParams {
  id: string
  filter: string
}
export const getData = ({ id, filter }: GetDataParams): Result => {}

// ❌ INTERDIT
export const getData = (id: string, filter: string): Result => {}
```

## 📦 Types & Interfaces

### Placement
- **Type utilisé dans 1 seul fichier** → Reste dans ce fichier (non exporté)
- **Type utilisé dans 2+ fichiers** → `types/nomDuType.ts` (1 type = 1 fichier)

### Organisation types/
```
types/
├── defaultEnergyPrices.ts    # export interface DefaultEnergyPrices
├── etatInstallation.ts       # export type EtatInstallation
└── housingCharacteristics.ts # export interface HousingCharacteristics
```

### Règles strictes
```ts
// ❌ INTERDIT - Type inline
const getData = (params: { id: string, name: string }) => {}

// ❌ INTERDIT - Interface locale mais utilisée ailleurs
interface MyType { ... }  // Utilisée dans 3 fichiers

// ✅ BON - Interface locale, usage unique
interface GetDataParams { ... }  // Utilisée uniquement ici
export const getData = (params: GetDataParams) => {}

// ✅ BON - Type partagé
// types/myType.ts
export interface MyType { ... }
```

## 🔄 Imports

**TOUJOURS** chemins absolus avec `@/` - **JAMAIS** relatifs

```ts
// ✅ BON - Imports depuis l'infrastructure partagée
import { useStepForm } from "@/app/(main)/[projectId]/(step)/hooks/useStepForm"
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper"

// ✅ BON - Imports depuis le step courant
import { getData } from "@/app/(main)/[projectId]/(step)/(content)/step-name/lib/getData"
import type { MyType } from "@/app/(main)/[projectId]/(step)/(content)/step-name/types/myType"

// ❌ INTERDIT
import { getData } from "../../lib/getData"
import type { MyType } from "../types/myType"
```

## 🗄️ Queries Prisma

### Principe
**NE PAS** utiliser `getProject()` qui charge TOUT → Créer query optimisée

```ts
// queries/getNomStepData.ts
"use server"

interface GetNomStepDataParams {
  projectId: string
}

export const getNomStepData = async ({ projectId }: GetNomStepDataParams) => {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Non autorisé")

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      nomStep: true,  // SEULEMENT ce dont on a besoin
    },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Non autorisé")
  }

  return { nomStep: project.nomStep }
}
```

## 📐 Organisation par Dossier

### page.tsx
Structure standard avec useStepForm hook :
```tsx
"use client"

import { use } from "react"
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper"
import { useStepForm } from "@/app/(main)/[projectId]/(step)/hooks/useStepForm"
import { MyFields } from "./components/MyFields"
import { saveMyData } from "./actions/saveMyData"
import { mySchema } from "./actions/mySchema"
import { getMyData } from "./queries/getMyData"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"
import { STEP_INFO } from "./config/stepInfo"

export default function MyStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)

  const {
    formData,
    errors,
    isSubmitting,
    isLoading,
    stepIndex,
    isLastStep,
    handleChange,
    handleSubmit,
    handlePrevious,
  } = useStepForm({
    projectId,
    stepKey: STEP_INFO.key,
    schema: mySchema,
    loadData: async ({ projectId }) => {
      const data = await getMyData({ projectId })
      return data.myField || {}
    },
    saveData: async ({ projectId, data }) => {
      await saveMyData({ projectId, data })
    },
  })

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  return (
    <StepWrapper
      title={STEP_INFO.title}
      description={STEP_INFO.description}
      stepNumber={stepIndex + 1}
      totalSteps={WIZARD_STEPS.length}
      explanation={STEP_INFO.explanation}
      isLastStep={isLastStep}
      isSubmitting={isSubmitting}
      onPrevious={handlePrevious}
      onNext={handleSubmit}
    >
      <MyFields formData={formData} errors={errors} onChange={handleChange} />
    </StepWrapper>
  )
}
```

### actions/
Server actions Next.js avec validation Zod
```ts
"use server"

interface SaveDataParams {
  projectId: string
  data: MyData
}

export const saveData = async ({ projectId, data }: SaveDataParams): Promise<Result> => {
  const session = await auth()
  // validation + save
}
```

### components/
Composants React **uniquement** pour cette page
- **1 composant = 1 fichier**
- Props typées avec interface

```tsx
interface MyComponentProps {
  data: MyData
  onChange: (value: string) => void
}

export const MyComponent = ({ data, onChange }: MyComponentProps) => (
  <div>...</div>
)
```

### lib/
Logique métier pure (pas de React, pas de Prisma direct)
```ts
interface CalculateParams {
  value1: number
  value2: number
}

export const calculate = ({ value1, value2 }: CalculateParams): number => {
  return value1 + value2
}
```

### config/
Configuration statique
```ts
export const STEP_INFO = {
  key: "step-name",
  title: "Titre",
  description: "Description",
  explanation: "Explication optionnelle",
}
```

## ✅ Checklist

Avant de considérer le code terminé :

- [ ] Hook `useStepForm` utilisé pour la logique
- [ ] Composant `StepWrapper` utilisé pour l'UI
- [ ] Tous les fichiers .ts en `camelCase`
- [ ] Tous les fichiers .tsx en `PascalCase`
- [ ] Arrow functions partout
- [ ] Paramètres multiples → objet + interface
- [ ] Types locaux non exportés si usage unique
- [ ] Types partagés dans `types/` (1 fichier = 1 type)
- [ ] Imports absolus `@/` partout
- [ ] Query Prisma optimisée dans `queries/`
- [ ] Aucun type inline
- [ ] Un composant par fichier

## 🚫 Interdictions Absolues

1. ❌ Chemins relatifs (`../../`)
2. ❌ `function` keyword (sauf pages Next.js)
3. ❌ Types inline
4. ❌ Paramètres individuels (toujours objet)
5. ❌ Types partagés hors de `types/`
6. ❌ Fichiers .ts en PascalCase
7. ❌ Fichiers .tsx en camelCase
8. ❌ Utiliser `getProject()` directement
9. ❌ Dupliquer la logique de step (utiliser `useStepForm`)
10. ❌ Réimplémenter le wrapper UI (utiliser `StepWrapper`)

## 📊 Bénéfices de l'Architecture

### Réduction du code
Grâce au hook `useStepForm` et au composant `StepWrapper`, chaque page step est réduite de **~40%** :
- Avant : ~120-160 lignes
- Après : ~60-100 lignes

### Cohérence
Tous les steps suivent le même pattern, facilitant :
- La maintenance
- L'ajout de nouvelles étapes
- La compréhension du code
- Le debugging

### Centralisation
Les changements de logique commune se font dans un seul endroit :
- `useStepForm` pour la logique métier
- `StepWrapper` pour l'UI et la structure
