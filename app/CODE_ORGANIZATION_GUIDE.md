# Guide d'Organisation du Code - ThermoGain

> Principes et bonnes pratiques pour structurer le code de l'application ThermoGain

## 📋 Table des matières

1. [Principes fondamentaux](#principes-fondamentaux)
2. [Structure des dossiers](#structure-des-dossiers)
3. [Nommage des fonctions](#nommage-des-fonctions)
4. [Séparation des responsabilités](#séparation-des-responsabilités)
5. [Server Actions](#server-actions)
6. [Composants React](#composants-react)
7. [Anti-patterns à éviter](#anti-patterns-à-éviter)
8. [Exemples concrets](#exemples-concrets)

---

## 🎯 Principes fondamentaux

### 1. Single Responsibility Principle (SRP)

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

### 2. Separation of Concerns

Séparer clairement les couches de l'application :

- **Data Layer** : Opérations de base de données (Prisma)
- **Business Logic** : Validation, transformation, règles métier
- **Presentation** : Composants React, UI
- **Communication** : API calls, envoi d'emails

### 3. Don't Repeat Yourself (DRY)

Factoriser le code dupliqué dans des fonctions réutilisables.

### 4. Keep It Simple, Stupid (KISS)

Préférer la simplicité à la complexité. Le code doit être facile à lire et comprendre.

---

## 📁 Structure des dossiers

### Organisation recommandée

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

### Règles de structure

1. **Colocation** : Placer les fichiers proches de leur utilisation
2. **Groupes de routes** : Utiliser `(nom)` pour grouper sans affecter l'URL
3. **Composants privés** : Dossier `components/` à côté de la page qui les utilise
4. **Logique métier** : Isoler dans des dossiers dédiés (`calculations/`, `workflows/`)

---

## 🏷️ Nommage des fonctions

### Convention : Verbe + Nom

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

### ❌ Noms à éviter

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

---

## 🔀 Séparation des responsabilités

### Data Layer (Prisma)

**Responsabilité** : Accès aux données uniquement

```typescript
// lib/db/users.ts
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function createUser(data: CreateUserData) {
  return prisma.user.create({ data })
}

export async function markUserEmailAsVerified(email: string) {
  return prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  })
}
```

### Business Logic Layer

**Responsabilité** : Validation, transformation, règles métier

```typescript
// lib/services/auth.ts
export async function validateRegistration(data: RegistrationData) {
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

### Workflow Layer (Orchestration)

**Responsabilité** : Orchestrer plusieurs opérations

```typescript
// lib/workflows/registration.ts
export async function registerUserWorkflow(data: RegistrationData) {
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

### Presentation Layer (React)

**Responsabilité** : Affichage et interactions utilisateur uniquement

```typescript
// app/(auth)/register/page.tsx
export default function RegisterPage() {
  const [error, setError] = useState('')

  async function handleSubmit(formData: FormData) {
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

---

## ⚡ Server Actions

### Structure recommandée

```typescript
// lib/actions/auth.ts
"use server"

import { validateRegistration } from "@/lib/services/auth"
import { createUser } from "@/lib/db/users"
import { sendVerificationEmail } from "@/lib/workflows/email"

/**
 * Inscrit un nouvel utilisateur et envoie l'email de vérification
 */
export async function registerUser(data: RegistrationData) {
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

### Bonnes pratiques

1. **Toujours typer** les paramètres et retours
2. **Gestion d'erreurs** explicite avec `try/catch`
3. **Retour cohérent** : `{ success: true }` ou `{ error: string }`
4. **Documentation** : JSDoc pour décrire ce que fait l'action
5. **Validation** en premier : fail fast
6. **Logging** des erreurs pour le debugging

---

## ⚛️ Composants React

### Structure d'un composant

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
export function LoginForm({ onSubmit, error }: LoginFormProps) {
  // 3a. State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 3b. Handlers
  async function handleSubmit(e: React.FormEvent) {
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

### Convention de nommage

- **Composants** : PascalCase (`UserProfile.tsx`, `ProjectCard.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useAuth.ts`, `useProject.ts`)
- **Utils** : camelCase (`formatDate.ts`, `calculateTotal.ts`)
- **Server Actions** : camelCase verbe+nom (`registerUser`, `createProject`)

### Taille des composants

**Règle** : Si un composant dépasse 200 lignes, envisager de le découper

```typescript
// ❌ Composant trop gros
export function ProjectPage() {
  // 500 lignes de logique et JSX
}

// ✅ Composants découpés
export function ProjectPage() {
  return (
    <div>
      <ProjectHeader />
      <ProjectForm />
      <ProjectResults />
    </div>
  )
}
```

---

## 🚫 Anti-patterns à éviter

### 1. Fonctions fourre-tout

```typescript
// ❌ MAUVAIS
async function handleEverything(email: string) {
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
async function sendVerificationWorkflow(email: string) {
  const user = await validateUserExists(email)
  const token = await createVerificationToken(email)
  const url = buildVerificationUrl(token)
  await sendVerificationEmail(email, url)
  await updateUserLastEmailSent(email)
}
```

### 2. Nommage trompeur

```typescript
// ❌ MAUVAIS : Le nom ne reflète pas toutes les actions
async function createToken(email: string) {
  const token = generateToken()
  await saveTokenToDb(email, token)
  await sendEmailWithToken(email, token)  // ⚠️ Pas évident depuis le nom !
  return token
}

// ✅ BON : Le nom décrit toutes les actions
async function createTokenAndSendEmail(email: string) {
  const token = generateToken()
  await saveTokenToDb(email, token)
  await sendEmailWithToken(email, token)
  return token
}

// ✅ MEILLEUR : Séparation claire
async function sendVerificationEmail(email: string) {
  const token = await createAndSaveToken(email)
  await sendEmail(email, buildUrl(token))
}
```

### 3. Logique dans les composants

```typescript
// ❌ MAUVAIS : Calculs complexes dans le composant
export function ResultsPage({ projectId }: Props) {
  const [results, setResults] = useState(null)

  useEffect(() => {
    async function calculate() {
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
export function ResultsPage({ projectId }: Props) {
  const [results, setResults] = useState(null)

  useEffect(() => {
    async function loadResults() {
      const project = await getProject(projectId)
      const calculatedResults = calculateAllResults(project) // Fonction isolée
      setResults(calculatedResults)
    }
    loadResults()
  }, [projectId])

  return <div>{/* render */}</div>
}
```

### 4. Dépendances circulaires

```typescript
// ❌ MAUVAIS
// fileA.ts
import { functionB } from './fileB'
export function functionA() { functionB() }

// fileB.ts
import { functionA } from './fileA'
export function functionB() { functionA() }

// ✅ BON : Extraire dans un fichier commun
// shared.ts
export function sharedLogic() { /* ... */ }

// fileA.ts
import { sharedLogic } from './shared'
export function functionA() { sharedLogic() }

// fileB.ts
import { sharedLogic } from './shared'
export function functionB() { sharedLogic() }
```

### 5. Couplage fort

```typescript
// ❌ MAUVAIS : Couplé à Resend
async function sendEmail(email: string, html: string) {
  await resend.emails.send({ from: 'noreply@app.com', to: email, html })
}

// ✅ BON : Abstraction
interface EmailService {
  send(to: string, html: string): Promise<void>
}

class ResendEmailService implements EmailService {
  async send(to: string, html: string) {
    await resend.emails.send({ from: 'noreply@app.com', to, html })
  }
}

// Facile de changer de service plus tard
const emailService: EmailService = new ResendEmailService()
```

---

## 💡 Exemples concrets

### Exemple 1 : Refactoring d'une fonction monolithique

**Avant** : Fonction qui fait trop de choses

```typescript
// email/lib/createVerificationToken.ts
export async function createVerificationToken(email: string, firstName?: string) {
  // 1. Générer token
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  // 2. Supprimer anciens tokens
  await prisma.emailVerificationToken.deleteMany({ where: { email } })

  // 3. Créer nouveau token
  await prisma.emailVerificationToken.create({
    data: { email, token, expires }
  })

  // 4. Construire URL
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`

  // 5. Rendre template
  const emailHtml = await render(
    VerificationEmail({ verificationUrl, firstName })
  )

  // 6. Envoyer email
  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Confirmez votre email ThermoGain",
    html: emailHtml,
  })
}
```

**Après** : Fonctions séparées par responsabilité

```typescript
// email/lib/tokens/generateToken.ts
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

// email/lib/tokens/saveToken.ts
export async function saveVerificationToken(
  email: string,
  token: string,
  expiresIn: number
) {
  const expires = new Date(Date.now() + expiresIn)

  await prisma.emailVerificationToken.deleteMany({ where: { email } })
  await prisma.emailVerificationToken.create({
    data: { email, token, expires }
  })
}

// email/lib/emails/buildVerificationUrl.ts
export function buildVerificationUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  return `${baseUrl}/verify-email?token=${token}`
}

// email/lib/emails/sendVerificationEmail.ts
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string,
  firstName?: string
) {
  const emailHtml = await render(
    VerificationEmail({ verificationUrl, firstName })
  )

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Confirmez votre email ThermoGain",
    html: emailHtml,
  })
}

// email/lib/workflows/sendVerificationWorkflow.ts
export async function sendVerificationWorkflow(
  email: string,
  firstName?: string
) {
  const token = generateToken()
  await saveVerificationToken(email, token, EMAIL_VERIFICATION_EXPIRES_IN)

  const url = buildVerificationUrl(token)
  await sendVerificationEmail(email, url, firstName)
}
```

### Exemple 2 : Organisation d'une feature complexe

```
app/(main)/projects/[projectId]/
├── page.tsx                         # Point d'entrée
├── layout.tsx                       # Layout partagé
├── types.ts                         # Types partagés
│
├── [step]/                          # Étapes du formulaire
│   ├── page.tsx
│   └── components/
│       ├── StepForm.tsx
│       ├── StepNavigation.tsx
│       └── StepProgress.tsx
│
├── results/                         # Page résultats
│   ├── page.tsx
│   ├── components/
│   │   ├── ResultsHeader.tsx
│   │   ├── ResultsChart.tsx
│   │   └── SendResultsButton.tsx
│   └── calculations/                # Logique métier isolée
│       ├── index.ts                 # Point d'entrée
│       ├── types.ts
│       ├── energySavings.ts
│       ├── investment.ts
│       └── roi.ts
│
└── data/                            # Data fetching
    ├── getProject.ts
    ├── updateProject.ts
    └── deleteProject.ts
```

### Exemple 3 : Server Action bien structurée

```typescript
// lib/actions/projects.ts
"use server"

import { auth } from "@/lib/auth"
import { validateProjectData } from "@/lib/services/projects"
import { createProject, updateProject } from "@/lib/db/projects"

/**
 * Crée un nouveau projet pour l'utilisateur connecté
 *
 * @param data - Données du projet à créer
 * @returns L'ID du projet créé ou une erreur
 */
export async function createProjectAction(data: ProjectFormData) {
  // 1. Authentification
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Non authentifié" }
  }

  // 2. Validation
  const validation = validateProjectData(data)
  if (!validation.success) {
    return { error: validation.error }
  }

  // 3. Création
  try {
    const project = await createProject({
      ...data,
      userId: session.user.id,
    })

    return { success: true, projectId: project.id }
  } catch (error) {
    console.error('Failed to create project:', error)
    return { error: "Erreur lors de la création du projet" }
  }
}
```

---

## 📚 Ressources complémentaires

### Principes SOLID

- **S**ingle Responsibility Principle
- **O**pen/Closed Principle
- **L**iskov Substitution Principle
- **I**nterface Segregation Principle
- **D**ependency Inversion Principle

### Clean Code (Robert C. Martin)

- Nommage explicite
- Fonctions courtes
- Pas de duplication
- Commentaires seulement si nécessaire

### React Best Practices

- Composition over inheritance
- Hooks rules
- Component purity
- State colocation

### Next.js App Router

- Server Components par défaut
- Client Components avec "use client"
- Server Actions avec "use server"
- Route groups avec (nom)

---

## ✅ Checklist avant commit

- [ ] Chaque fonction a une responsabilité unique
- [ ] Les noms de fonctions sont explicites (verbe + nom)
- [ ] La logique métier est séparée de la présentation
- [ ] Pas de code dupliqué
- [ ] Les types TypeScript sont définis
- [ ] Les erreurs sont gérées proprement
- [ ] Les fonctions font moins de 50 lignes (idéalement)
- [ ] Les composants font moins de 200 lignes
- [ ] Pas de dépendances circulaires
- [ ] Le code est testable (pas de couplage fort)

---

## 🔄 Évolution du guide

Ce guide est un document vivant. N'hésite pas à le mettre à jour lorsque tu identifies de nouveaux patterns ou anti-patterns dans le projet.

**Dernière mise à jour** : 3 décembre 2024
