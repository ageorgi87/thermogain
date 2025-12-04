# ThermoGain - Instructions Claude

> Directives permanentes pour maintenir la qualité et la cohérence du projet ThermoGain

---

## 📚 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Stack technique](#stack-technique)
3. [Objectifs du projet](#objectifs-du-projet)
4. [Bonnes pratiques de code](#bonnes-pratiques-de-code)
5. [Architecture et organisation](#architecture-et-organisation)
6. [Workflow Git](#workflow-git)
7. [Gestion des fichiers CLAUDE.md](#gestion-des-fichiers-claudemd)
8. [Ressources](#ressources)

---

## 🎯 Vue d'ensemble

**ThermoGain** est une application web professionnelle permettant aux installateurs de pompes à chaleur de créer des études de rentabilité personnalisées pour leurs clients.

**Type d'application** : B2B SaaS - Outil de simulation financière
**Utilisateurs cibles** : Professionnels RGE (Reconnu Garant de l'Environnement)
**Valeur ajoutée** : Calculs automatisés, envoi par email, interface professionnelle

---

## 💻 Stack technique

### Framework et Runtime

```json
{
  "framework": "Next.js 16.0.3 (App Router)",
  "runtime": "React 19.2.0",
  "language": "TypeScript 5.x",
  "styling": "Tailwind CSS 4.x"
}
```

### Base de données et ORM

```json
{
  "database": "PostgreSQL (Neon)",
  "orm": "Prisma 6.19.0",
  "schema": "Multi-file architecture (prisma/schema/)"
}
```

### Authentification

```json
{
  "provider": "NextAuth.js 5.0.0-beta.30",
  "strategy": "JWT (credentials)",
  "verification": "Custom email verification tokens"
}
```

### UI et Composants

```json
{
  "library": "shadcn/ui (Radix UI primitives)",
  "icons": "Lucide React 0.554.0",
  "charts": "Recharts 2.15.4",
  "validation": "Zod 4.1.13"
}
```

### Emails

```json
{
  "service": "Resend 6.5.2",
  "templates": "React Email (@react-email/components 1.0.1)",
  "rendering": "@react-email/render 2.0.0"
}
```

### Déploiement et Infrastructure

```json
{
  "hosting": "Vercel (production)",
  "database": "Neon PostgreSQL (cloud)",
  "domain": "thermogain.fr"
}
```

---

## 🎯 Objectifs du projet

### 1. Simplifier la création d'études PAC

Permettre aux professionnels de générer rapidement des études de rentabilité complètes sans calculs manuels complexes.

### 2. Professionnaliser la relation client

Fournir des documents PDF et emails de qualité professionnelle avec branding personnalisé.

### 3. Automatiser les calculs financiers

- Coût total d'installation (PAC + travaux + aides)
- Économies d'énergie annuelles et sur 17 ans
- Retour sur investissement (ROI)
- Comparaison chauffage actuel vs PAC

### 4. Faciliter le suivi des projets

Interface intuitive permettant de gérer plusieurs projets clients simultanément.

### 5. Garantir la délivrabilité des emails

Configuration SPF/DKIM/DMARC optimale pour que les emails arrivent en boîte de réception.

---

## ✨ Bonnes pratiques de code

### Convention de nommage des fichiers

**RÈGLE ABSOLUE** : Respecter la casse selon le type de fichier.

#### Fichiers TypeScript (.ts)

```
✅ camelCase
lib/actions/auth.ts
lib/utils/formatCurrency.ts
email/lib/tokens/generateToken.ts

❌ PascalCase pour .ts
lib/actions/Auth.ts
lib/utils/FormatCurrency.ts
```

#### Fichiers TSX (.tsx) - Composants React

```
✅ PascalCase
components/ui/Button.tsx
app/(main)/projects/[projectId]/results/components/ResultsHeader.tsx
email/templates/VerificationEmail.tsx

❌ camelCase pour .tsx
components/ui/button.tsx
email/templates/verificationEmail.tsx
```

#### Fichiers Markdown (.md) - Documentation

```
✅ camelCase (sauf CLAUDE.md)
docs/methodologieCalculs.md
docs/calculsCouts.md
docs/calculsConsommation.md
docs/calculsEconomieRoi.md
docs/guideTheming.md

❌ kebab-case pour .md
docs/methodologie-calculs.md
docs/calculs-couts.md
docs/calculs-consommation.md

⚠️ Exception : CLAUDE.md (UPPERCASE)
CLAUDE.md
prisma/CLAUDE.md
email/CLAUDE.md
```

### Imports : Chemins absolus obligatoires

**TOUJOURS** utiliser `@/` pour les imports. **JAMAIS** de chemins relatifs.

```typescript
// ✅ BON : Chemins absolus
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/email/lib/emails/sendEmail"
import type { ProjectData } from "@/app/(main)/projects/[projectId]/types"

// ❌ INTERDIT : Chemins relatifs
import { Button } from "../../components/ui/button"
import { prisma } from "../../../lib/prisma"
import { sendEmail } from "./emails/sendEmail"
```

**Pourquoi cette règle ?**
- ✅ Facilite les refactorings (déplacer fichiers sans casser imports)
- ✅ Améliore la lisibilité (on voit immédiatement la structure)
- ✅ Évite les erreurs (`../../` vs `../../../`)
- ✅ Cohérence totale du codebase

### Fonctions : Arrow functions obligatoires

**TOUJOURS** utiliser les arrow functions. **JAMAIS** `function` keyword.

```typescript
// ✅ BON : Arrow functions
export const registerUser = async (data: RegistrationData) => {
  // ...
}

const calculateROI = (investment: number, savings: number): number => {
  return investment / savings
}

// ❌ INTERDIT : Function keyword
export async function registerUser(data: RegistrationData) {
  // ...
}

function calculateROI(investment: number, savings: number): number {
  return investment / savings
}
```

**Exception** : Pages Next.js et composants React peuvent utiliser `function` ou `const`.

```typescript
// ✅ Acceptable pour pages Next.js
export default function ProjectPage() {
  return <div>...</div>
}

// ✅ Aussi acceptable
const ProjectPage = () => {
  return <div>...</div>
}
export default ProjectPage
```

### Exports : Nommés par défaut, default uniquement si requis

**PRÉFÉRER** les exports nommés. **UTILISER** default export seulement quand Next.js l'exige.

```typescript
// ✅ BON : Exports nommés (utilitaires, actions, hooks)
// lib/utils/formatCurrency.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// lib/actions/auth.ts
export const registerUser = async (data: RegistrationData) => {
  // ...
}

export const loginUser = async (credentials: LoginData) => {
  // ...
}

// ✅ BON : Default export (pages Next.js, layouts)
// app/(main)/projects/page.tsx
const ProjectsPage = () => {
  return <div>...</div>
}
export default ProjectsPage

// app/(main)/layout.tsx
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}
export default MainLayout

// ❌ ÉVITER : Default export pour utilitaires
// lib/utils/formatCurrency.ts
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR').format(amount)
}
export default formatCurrency
```

**Pourquoi cette règle ?**
- ✅ Exports nommés : autocomplete fonctionne mieux
- ✅ Exports nommés : refactoring plus sûr (renommage automatique)
- ✅ Exports nommés : plusieurs fonctions par fichier possible
- ✅ Default uniquement pour Next.js (pages, layouts, route handlers)

### TypeScript : Types stricts obligatoires

**RÈGLE ABSOLUE** : **INTERDICTION TOTALE** du type `any`. Toujours créer des types explicites.

```typescript
// ✅ BON : Types explicites
export const calculateROI = (
  investment: number,
  annualSavings: number
): number => {
  return investment / annualSavings
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (params: SendEmailParams): Promise<void> => {
  // ...
}

// ❌ INTERDIT : any ou types manquants
export const calculateROI = (investment, annualSavings) => {
  return investment / annualSavings
}

export const sendEmail = async (params: any) => {
  // ...
}

// ❌ INTERDIT : Utilisation de 'as any' pour contourner les types
setFormData((data.logement as any) || {})

// ✅ BON : Mapper les données Prisma vers des types stricts
const logement: Partial<HousingData> | null = project.logement ? {
  code_postal: project.logement.code_postal,
  annee_construction: project.logement.annee_construction,
  surface_habitable: project.logement.surface_habitable,
  nombre_occupants: project.logement.nombre_occupants,
  qualite_isolation: project.logement.qualite_isolation as HousingData["qualite_isolation"],
} : null

setFormData(logement || {})
```

**Pourquoi cette règle ?**
- ✅ `any` annule complètement les bénéfices de TypeScript
- ✅ Les types stricts préviennent les bugs à la compilation
- ✅ L'autocomplétion fonctionne correctement avec des types stricts
- ✅ Le refactoring est plus sûr avec des types explicites

### Gestion d'erreurs : try/catch explicites

```typescript
// ✅ BON : Gestion d'erreurs explicite
export const createProject = async (data: ProjectData) => {
  try {
    const project = await prisma.project.create({ data })
    return { success: true, project }
  } catch (error) {
    console.error('[createProject] Error:', error)
    return { success: false, error: 'Failed to create project' }
  }
}

// ❌ MAUVAIS : Laisser les erreurs non gérées
export const createProject = async (data: ProjectData) => {
  const project = await prisma.project.create({ data })
  return { success: true, project }
}
```

---

## 📐 Architecture et organisation

### Principes fondamentaux

#### 1. Single Responsibility Principle (SRP)

**Règle d'or** : Une fonction = une responsabilité

```typescript
// ❌ MAUVAIS : Fait trop de choses
async function createVerificationToken(email: string, firstName?: string) {
  const token = generateToken()
  await prisma.emailVerificationToken.create({ ... })
  const url = buildUrl(token)
  await sendEmail(url)
}

// ✅ BON : Responsabilité unique, orchestration claire
async function sendVerificationEmail(email: string, firstName?: string) {
  const token = await createToken(email)
  const url = buildVerificationUrl(token)
  await sendEmail({ to: email, html: renderTemplate(url, firstName) })
}
```

#### 2. Separation of Concerns

Séparer clairement les couches de l'application :

- **Data Layer** : Opérations de base de données (Prisma)
- **Business Logic** : Validation, transformation, règles métier
- **Presentation** : Composants React, UI
- **Communication** : API calls, envoi d'emails

#### 3. Don't Repeat Yourself (DRY)

Factoriser le code dupliqué dans des fonctions réutilisables.

#### 4. Keep It Simple, Stupid (KISS)

Préférer la simplicité à la complexité. Le code doit être facile à lire et comprendre.

### Structure des dossiers

```
app/
├── (auth)/                          # Groupe de routes - Authentification
│   ├── login/
│   ├── register/
│   └── verify-email/
│       ├── page.tsx                 # Page principale
│       └── components/              # Composants spécifiques à cette page
│
├── (main)/                          # Groupe de routes - Application principale
│   ├── projects/
│   │   └── [projectId]/
│   │       ├── [step]/
│   │       │   ├── page.tsx
│   │       │   └── components/
│   │       ├── results/
│   │       │   ├── page.tsx
│   │       │   ├── components/
│   │       │   └── calculations/    # Logique métier isolée
│   │       └── types.ts             # Types partagés
│   └── profil/
│
├── api/                             # Routes API
│   └── auth/
│       └── [...nextauth]/
│
└── components/                      # Composants globaux réutilisables
    └── ui/                          # Composants UI de base (shadcn/ui)

lib/
├── actions/                         # Server Actions (use server)
│   ├── auth.ts
│   ├── password-reset.ts
│   └── projects.ts
├── utils/                           # Fonctions utilitaires pures
├── hooks/                           # Custom React hooks
└── prisma.ts                        # Instance Prisma singleton

email/
├── lib/                             # Logique métier emails
│   ├── tokens/                      # Gestion des tokens
│   ├── emails/                      # Envoi d'emails
│   └── users/                       # Opérations utilisateurs
└── templates/                       # Templates React Email
```

**Règles de structure** :

1. **Colocation** : Placer les fichiers proches de leur utilisation
2. **Groupes de routes** : Utiliser `(nom)` pour grouper sans affecter l'URL
3. **Composants privés** : Dossier `components/` à côté de la page qui les utilise
4. **Logique métier** : Isoler dans des dossiers dédiés (`calculations/`, `workflows/`)

### Nommage des fonctions

**Convention** : Verbe + Nom

#### Opérations CRUD

```typescript
// Create
createUser()
createProject()
createToken()

// Read
getUser()
getUserById()
findUserByEmail()
listProjects()

// Update
updateUser()
updateProject()
markEmailAsVerified()

// Delete
deleteUser()
deleteProject()
deleteExpiredTokens()
```

#### Validation

```typescript
validateToken()
validateEmail()
checkUserExists()
isTokenExpired()
```

#### Transformation

```typescript
formatCurrency()
calculateResults()
transformProjectData()
serializeUser()
```

#### Communication

```typescript
sendEmail()
sendVerificationEmail()
sendPasswordResetEmail()
fetchUserData()
```

#### Rendu

```typescript
renderTemplate()
renderEmailHtml()
buildVerificationUrl()
```

#### ❌ Noms à éviter

```typescript
// Trop vague
process()
handle()
doSomething()
manager()

// Trop long
createUserAndSendVerificationEmailAndLogActivity()

// Trompeur (nom ne reflète pas toutes les actions)
createToken() // mais envoie aussi un email ❌
```

### Règle : Filename = Function name

**Règle d'or** : Quand un fichier contient une seule fonction exportée, le nom du fichier doit correspondre exactement au nom de la fonction.

### Règle : Une fonction par fichier (SRP strict)

**RÈGLE ABSOLUE** : Chaque fichier ne doit exporter qu'UNE SEULE fonction. Pas de fichiers avec plusieurs exports de fonctions.

**INTERDICTION FORMELLE** : Ne jamais créer de fichiers `index.ts` qui centralisent les exports. Chaque import doit être explicite et pointer directement vers le fichier de la fonction.

```typescript
// ❌ INTERDIT : Fichier avec plusieurs fonctions
// lib/subscription/rates.ts
export const getElectricityRate = () => { /* ... */ }
export const getGasRate = () => { /* ... */ }
export const getMaintenanceCost = () => { /* ... */ }

// ❌ INTERDIT : Fichier index.ts qui centralise
// lib/subscription/index.ts
export { getElectricityRate } from './getElectricityRate'
export { getGasRate } from './getGasRate'
export { getMaintenanceCost } from './getMaintenanceCost'

// ✅ BON : Une fonction par fichier + imports directs
// lib/subscription/getElectricityRate.ts
export const getElectricityRate = () => { /* ... */ }

// lib/subscription/getGasRate.ts
export const getGasRate = () => { /* ... */ }

// lib/subscription/getMaintenanceCost.ts
export const getMaintenanceCost = () => { /* ... */ }

// Dans un autre fichier:
import { getElectricityRate } from "@/lib/subscription/getElectricityRate"
import { getGasRate } from "@/lib/subscription/getGasRate"
```

**Exceptions autorisées** :
- `*Data.ts` : Fichiers contenant uniquement des constantes, types, et interfaces (pas de fonctions)
- `helpers/` : Fonctions privées non exportées pour usage interne au module uniquement

**Pourquoi cette règle ?**
- ✅ Responsabilité unique (Single Responsibility Principle)
- ✅ Code plus testable et maintenable
- ✅ Dépendances explicites (on voit exactement ce qui est utilisé)
- ✅ Évite les imports circulaires
- ✅ Facilite la navigation dans le code (pas de "barrel exports" trompeurs)

### Règle : Gestion des types et interfaces

**RÈGLE** : Les types et interfaces doivent être placés selon leur portée d'utilisation.

#### Types/Interfaces utilisés dans UN SEUL fichier

**Déclaration locale** : Le type/interface doit rester dans le fichier qui l'utilise, non exporté.

```typescript
// ✅ BON : Interface locale non exportée
// lib/energyEvolution/models/analyzeEnergyPriceHistory.ts
interface HistoricalAnalysis {
  tauxRecent: number
  tauxEquilibre: number
  yearsOfData: number
}

export const analyzeEnergyPriceHistory = async (): Promise<HistoricalAnalysis> => {
  // ...
}

// ❌ MAUVAIS : Interface exportée alors qu'utilisée nulle part ailleurs
// lib/energyEvolution/models/energyPriceHistoryData.ts
export interface HistoricalAnalysis {
  tauxRecent: number
  tauxEquilibre: number
}
```

#### Types/Interfaces utilisés dans PLUSIEURS fichiers

**Extraction obligatoire** : Le type/interface doit être extrait et placé dans le dossier `/types` à la racine du projet.

```typescript
// ✅ BON : Type partagé dans /types
// types/project.ts
export interface Project {
  id: string
  userId: string
  name: string
  createdAt: Date
}

// Utilisé dans plusieurs fichiers:
// lib/actions/projects/createProject.ts
import type { Project } from "@/types/project"

// lib/actions/projects/getProject.ts
import type { Project } from "@/types/project"

// app/(main)/projects/page.tsx
import type { Project } from "@/types/project"
```

**Organisation du dossier /types** :
```
types/
├── project.ts           # Types liés aux projets
├── user.ts              # Types liés aux utilisateurs
├── energy.ts            # Types liés à l'énergie
└── calculation.ts       # Types liés aux calculs
```

**Pourquoi cette règle ?**
- ✅ Évite la duplication de types
- ✅ Facilite la maintenance (un seul endroit à modifier)
- ✅ Respecte le principe DRY (Don't Repeat Yourself)
- ✅ Centralise les types partagés pour meilleure découvrabilité
- ❌ Évite les fichiers *Data.ts inutiles pour des types utilisés localement

```typescript
// ❌ MAUVAIS
// Fichier : validateToken.ts
export function isTokenExpired(date: Date): boolean {
  return date < new Date()
}

// ✅ BON
// Fichier : isTokenExpired.ts
export function isTokenExpired(date: Date): boolean {
  return date < new Date()
}
```

**Exemples concrets du projet:**

```
email/lib/
├── tokens/
│   ├── generateToken.ts          → export function generateToken()
│   ├── saveVerificationToken.ts  → export function saveVerificationToken()
│   ├── findVerificationToken.ts  → export function findVerificationToken()
│   ├── deleteVerificationToken.ts→ export function deleteVerificationToken()
│   └── isTokenExpired.ts         → export function isTokenExpired()
├── emails/
│   ├── buildVerificationUrl.ts   → export function buildVerificationUrl()
│   ├── renderVerificationEmail.ts→ export function renderVerificationEmail()
│   └── sendVerificationEmail.ts  → export function sendVerificationEmail()
└── users/
    ├── findUserByEmail.ts        → export function findUserByEmail()
    └── markEmailAsVerified.ts    → export function markEmailAsVerified()
```

**Avantages:**
- ✅ Import/export cohérents et prévisibles
- ✅ Facile à trouver une fonction par son nom
- ✅ Évite les confusions sur ce que contient un fichier
- ✅ Facilite les refactorings automatiques

**Exception:** Les fichiers avec plusieurs exports liés (comme `types.ts`, `constants.ts`, `index.ts`) ne suivent pas cette règle.

### Séparation des responsabilités en couches

#### Data Layer (Prisma)

**Responsabilité** : Accès aux données uniquement

```typescript
// lib/db/users.ts
export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  })
}

export const createUser = async (data: CreateUserData) => {
  return prisma.user.create({ data })
}

export const markUserEmailAsVerified = async (email: string) => {
  return prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  })
}
```

#### Business Logic Layer

**Responsabilité** : Validation, transformation, règles métier

```typescript
// lib/services/auth.ts
export const validateRegistration = async (data: RegistrationData) => {
  if (!data.email.includes('@')) {
    throw new Error('Email invalide')
  }

  if (data.password.length < 6) {
    throw new Error('Mot de passe trop court')
  }

  const existingUser = await findUserByEmail(data.email)
  if (existingUser) {
    throw new Error('Email déjà utilisé')
  }
}
```

#### Workflow Layer (Orchestration)

**Responsabilité** : Orchestrer plusieurs opérations

```typescript
// lib/workflows/registration.ts
export const registerUserWorkflow = async (data: RegistrationData) => {
  // 1. Valider
  await validateRegistration(data)

  // 2. Créer utilisateur
  const hashedPassword = await hash(data.password, 12)
  const user = await createUser({ ...data, password: hashedPassword })

  // 3. Envoyer email de vérification
  await sendVerificationEmailWorkflow(user.email, user.firstName)

  return user
}
```

#### Presentation Layer (React)

**Responsabilité** : Affichage et interactions utilisateur uniquement

```typescript
// app/(auth)/register/page.tsx
export default function RegisterPage() {
  const [error, setError] = useState('')

  const handleSubmit = async (formData: FormData) => {
    try {
      await registerUser(Object.fromEntries(formData))
      redirect('/verify-email')
    } catch (err) {
      setError(err.message)
    }
  }

  return <RegisterForm onSubmit={handleSubmit} error={error} />
}
```

### Server Actions - Bonnes pratiques

```typescript
// lib/actions/auth.ts
"use server"

import { validateRegistration } from "@/lib/services/auth"
import { createUser } from "@/lib/db/users"
import { sendVerificationEmail } from "@/lib/workflows/email"

/**
 * Inscrit un nouvel utilisateur et envoie l'email de vérification
 */
export const registerUser = async (data: RegistrationData) => {
  // Validation
  const validation = await validateRegistration(data)
  if (validation.error) {
    return { error: validation.error }
  }

  // Création
  const user = await createUser(data)

  // Email
  try {
    await sendVerificationEmail(user.email, user.firstName)
  } catch (error) {
    console.error('Failed to send verification email:', error)
    // Ne pas bloquer l'inscription si l'email échoue
  }

  return { success: true, userId: user.id }
}
```

**Standards obligatoires** :

1. **Toujours typer** les paramètres et retours
2. **Gestion d'erreurs** explicite avec `try/catch`
3. **Retour cohérent** : `{ success: true }` ou `{ error: string }`
4. **Documentation** : JSDoc pour décrire ce que fait l'action
5. **Validation** en premier : fail fast
6. **Logging** des erreurs pour le debugging

### Composants React - Structure

```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { validateEmail } from '@/lib/utils/validation'

// 2. Types
interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  error?: string
}

// 3. Composant
export const LoginForm = ({ onSubmit, error }: LoginFormProps) => {
  // 3a. State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 3b. Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(email, password)
    } finally {
      setIsLoading(false)
    }
  }

  // 3c. Render
  return (
    <form onSubmit={handleSubmit}>
      {/* JSX */}
    </form>
  )
}
```

**Taille des composants** : Si un composant dépasse 200 lignes, envisager de le découper

### Anti-patterns à éviter

#### 1. Fonctions fourre-tout

```typescript
// ❌ MAUVAIS
const handleEverything = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('User not found')

  const token = crypto.randomBytes(32).toString('hex')
  await prisma.token.create({ data: { email, token } })

  const url = `${process.env.URL}/verify?token=${token}`
  await resend.emails.send({
    to: email,
    html: `<a href="${url}">Verify</a>`
  })

  await prisma.user.update({
    where: { email },
    data: { lastEmailSent: new Date() }
  })
}

// ✅ BON : Fonctions séparées avec orchestration
const sendVerificationWorkflow = async (email: string) => {
  const user = await validateUserExists(email)
  const token = await createVerificationToken(email)
  const url = buildVerificationUrl(token)
  await sendVerificationEmail(email, url)
  await updateUserLastEmailSent(email)
}
```

#### 2. Nommage trompeur

```typescript
// ❌ MAUVAIS : Le nom ne reflète pas toutes les actions
const createToken = async (email: string) => {
  const token = generateToken()
  await saveTokenToDb(email, token)
  await sendEmailWithToken(email, token)  // ⚠️ Pas évident depuis le nom !
  return token
}

// ✅ BON : Le nom décrit toutes les actions
const createTokenAndSendEmail = async (email: string) => {
  const token = generateToken()
  await saveTokenToDb(email, token)
  await sendEmailWithToken(email, token)
  return token
}

// ✅ MEILLEUR : Séparation claire
const sendVerificationEmail = async (email: string) => {
  const token = await createAndSaveToken(email)
  await sendEmail(email, buildUrl(token))
}
```

#### 3. Logique dans les composants

```typescript
// ❌ MAUVAIS : Calculs complexes dans le composant
export const ResultsPage = ({ projectId }: Props) => {
  const [results, setResults] = useState(null)

  useEffect(() => {
    const calculate = async () => {
      const project = await getProject(projectId)

      // 50 lignes de calculs complexes ici...
      const investment = project.heatPumpCost + project.installationCost
      const savings = calculateEnergySavings(project)
      // etc.

      setResults({ investment, savings })
    }
    calculate()
  }, [projectId])

  return <div>{/* render */}</div>
}

// ✅ BON : Logique isolée
export const ResultsPage = ({ projectId }: Props) => {
  const [results, setResults] = useState(null)

  useEffect(() => {
    const loadResults = async () => {
      const project = await getProject(projectId)
      const calculatedResults = calculateAllResults(project) // Fonction isolée
      setResults(calculatedResults)
    }
    loadResults()
  }, [projectId])

  return <div>{/* render */}</div>
}
```

#### 4. Dépendances circulaires

```typescript
// ❌ MAUVAIS
// fileA.ts
import { functionB } from './fileB'
export const functionA = () => { functionB() }

// fileB.ts
import { functionA } from './fileA'
export const functionB = () => { functionA() }

// ✅ BON : Extraire dans un fichier commun
// shared.ts
export const sharedLogic = () => { /* ... */ }

// fileA.ts
import { sharedLogic } from './shared'
export const functionA = () => { sharedLogic() }

// fileB.ts
import { sharedLogic } from './shared'
export const functionB = () => { sharedLogic() }
```

### Organisation spécifique

#### Prisma

Voir **[prisma/CLAUDE.md](prisma/CLAUDE.md)** pour directives schema.

**Règles clés** :
- Multi-file schema (domain-driven)
- Pas de `@default()` pour valeurs métier
- Supprimer champs inutilisés systématiquement

#### Emails

Voir **[email/CLAUDE.md](email/CLAUDE.md)** pour directives emails.

**Règles clés** :
- Un seul `EmailLayout.tsx`
- Largeur max 600px
- Table-based layout (pas de div)
- Styles inline obligatoires
- Alt text sur toutes les images

---

## 🔀 Workflow Git

### Règle absolue : Jamais commit/push sans autorisation

**INTERDICTION FORMELLE** de committer ou pusher du code sans demander l'autorisation explicite de l'utilisateur.

```bash
# ❌ INTERDIT : Commit automatique
git add .
git commit -m "Fix bug"
git push

# ✅ OBLIGATOIRE : Demander d'abord
# "J'ai terminé les modifications. Voulez-vous que je committe et push ?"
# Attendre réponse de l'utilisateur
# Si oui → faire commit et push
# Si non → ne rien faire
```

### Avant chaque commit

**Checklist obligatoire** :

- [ ] Pas d'imports relatifs (`../../`) - uniquement `@/`
- [ ] Fichiers .ts en camelCase
- [ ] Fichiers .tsx en PascalCase
- [ ] Arrow functions partout (sauf pages Next.js si préférence)
- [ ] Types TypeScript explicites
- [ ] Gestion d'erreurs avec try/catch
- [ ] Pas de code dupliqué
- [ ] Validation schema Prisma : `npx prisma validate`
- [ ] Build réussi : `npm run build`

### Messages de commit

**Format recommandé** :

```
<type>: <description courte>

<description détaillée optionnelle>

<footer optionnel avec références>
```

**Types** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `refactor`: Refactoring sans changement fonctionnel
- `docs`: Documentation uniquement
- `style`: Formatage, points-virgules manquants
- `test`: Ajout/modification de tests
- `chore`: Maintenance (deps, config)

**Exemples** :

```bash
git commit -m "feat: Add email results sending feature

Implemented SendResultsButton component with loading states
Created sendStudyResults server action
Added StudyResultsEmail template with professional mentions"

git commit -m "refactor: Split email verification into separate functions

Extracted token generation, storage, and email sending
Created workflow orchestration layer
Improved testability and maintainability"

git commit -m "fix: Remove unused Prisma fields and NextAuth models

Removed Account, Session, VerificationToken (100% unused)
Cleaned User model (name, image fields)
Updated queries to remove user.name references"
```

---

## 📝 Gestion des fichiers CLAUDE.md

### Règle : Mise à jour systématique

**IMPORTANT** : Chaque fois qu'un nouveau fichier `CLAUDE.md` est créé dans un sous-dossier du projet, ce fichier principal (`CLAUDE.md` à la racine) **DOIT** être mis à jour pour référencer le nouveau fichier.

#### Processus obligatoire

1. **Lors de la création d'un nouveau CLAUDE.md** :
   - Créer le fichier dans son dossier respectif (ex: `prisma/CLAUDE.md`, `email/CLAUDE.md`)
   - Immédiatement après, mettre à jour la section "Ressources" de ce fichier
   - Ajouter une référence avec une brève description

2. **Format de référence** :

```markdown
### Documentation du projet

- **[nom-dossier/CLAUDE.md](nom-dossier/CLAUDE.md)** - Description brève du contenu
```

#### Exemple concret

Si création de `components/CLAUDE.md` pour documenter les composants :

```markdown
### Documentation du projet

- **[prisma/CLAUDE.md](prisma/CLAUDE.md)** - Directives Prisma schema
- **[email/CLAUDE.md](email/CLAUDE.md)** - Directives système email
- **[components/CLAUDE.md](components/CLAUDE.md)** - Standards composants React
```

#### Pourquoi cette règle ?

- ✅ Centralise la documentation dans un index unique
- ✅ Facilite la découverte des directives existantes
- ✅ Maintient une source de vérité à jour
- ✅ Évite la documentation orpheline ou oubliée

---

## 📚 Ressources

### Documentation du projet

- **[docs/](docs/)** - Documentation métier et calculs
  - [methodologieCalculs.md](docs/methodologieCalculs.md) - Méthodologie générale de calcul
  - [calculsCouts.md](docs/calculsCouts.md) - Calculs de coûts (chauffage actuel et PAC)
  - [calculsConsommation.md](docs/calculsConsommation.md) - Calculs de consommation PAC
  - [calculsEconomieRoi.md](docs/calculsEconomieRoi.md) - Économies et ROI
  - [guideTheming.md](docs/guideTheming.md) - Guide du système de thème
- **[config/constants.ts](config/constants.ts)** - Source unique de vérité pour toutes les constantes
- **[prisma/CLAUDE.md](prisma/CLAUDE.md)** - Directives Prisma schema
- **[email/CLAUDE.md](email/CLAUDE.md)** - Directives système email

### Documentation externe

#### Next.js
- [App Router Documentation](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

#### Prisma
- [Prisma Client API](https://www.prisma.io/docs/orm/prisma-client)
- [Multi-File Schema](https://www.prisma.io/blog/organize-your-prisma-schema-with-multi-file-support)
- [Best Practices](https://www.prisma.io/docs/orm/prisma-schema/overview/introduction)

#### React Email
- [React Email Documentation](https://react.email/)
- [Resend Documentation](https://resend.com/docs)

#### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## ✅ Checklist avant de coder

Avant de commencer toute tâche :

1. [ ] Ai-je lu les directives pertinentes ?
   - Ce fichier CLAUDE.md si code général
   - prisma/CLAUDE.md si modifications schema
   - email/CLAUDE.md si templates email

2. [ ] Ai-je compris l'objectif de la tâche ?
   - Quelle fonctionnalité implémenter ?
   - Quels sont les critères de succès ?
   - Y a-t-il des contraintes spécifiques ?

3. [ ] Ai-je vérifié l'architecture existante ?
   - Où placer les nouveaux fichiers ?
   - Quelles fonctions réutiliser ?
   - Respecte-t-on la séparation des responsabilités ?

4. [ ] Ai-je suivi les conventions de nommage ?
   - .ts en camelCase
   - .tsx en PascalCase
   - Imports absolus avec `@/`
   - Arrow functions

5. [ ] Ai-je validé avant de terminer ?
   - `npx prisma validate` si schema modifié
   - `npm run build` pour vérifier TypeScript
   - Gestion d'erreurs présente
   - Types explicites partout

6. [ ] Ai-je demandé autorisation avant commit ?
   - **JAMAIS** commit automatique
   - **TOUJOURS** demander confirmation
   - Message de commit clair et descriptif

---

**Version** : 1.1
**Dernière mise à jour** : 3 décembre 2024

**IMPORTANT** : Ce fichier contient les directives permanentes pour ThermoGain. Toute modification du code doit respecter ces standards, quelle que soit l'évolution future du projet.

🚀 **Bienvenue sur ThermoGain ! Construisons quelque chose de professionnel et maintenable.**
