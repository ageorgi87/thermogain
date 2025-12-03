# Instructions Claude - Gestion des Emails

> Directives pour créer et maintenir des emails transactionnels de qualité professionnelle

## 🎯 Principes fondamentaux

### 1. Architecture des emails

**TOUJOURS** suivre cette structure :

```
email/
├── lib/
│   ├── resend.ts                    # Configuration Resend
│   ├── tokens/                      # Gestion tokens (génération, validation)
│   ├── emails/                      # Logique envoi emails
│   ├── users/                       # Opérations utilisateurs
│   └── workflows/                   # Orchestration (combinaison opérations)
├── templates/
│   ├── EmailLayout.tsx              # Layout réutilisable (un seul)
│   ├── [Template1].tsx              # Un template = un fichier
│   ├── [Template2].tsx
│   └── ...
└── CLAUDE.md                        # Ce fichier
```

### 2. Nommage des fichiers

**Templates** :
- ✅ PascalCase : `VerificationEmail.tsx`, `PasswordResetEmail.tsx`
- ✅ Nom descriptif du contenu
- ❌ Pas de camelCase : `verificationEmail.tsx`

**Fonctions utilitaires** :
- ✅ camelCase : `generateToken.ts`, `sendEmail.ts`
- ✅ Filename = nom de fonction (si une seule fonction)
- ❌ Pas de fichiers "fourre-tout" : `utils.ts`, `helpers.ts`

### 3. Séparation des responsabilités

**4 couches distinctes** :

1. **Tokens** (`lib/tokens/`) : Génération, validation, stockage tokens
2. **Emails** (`lib/emails/`) : Render templates, envoi via API
3. **Users** (`lib/users/`) : Opérations sur utilisateurs
4. **Workflows** (`lib/workflows/`) : Orchestration de plusieurs opérations

**Exemple** :
```typescript
// ❌ MAUVAIS : Fonction monolithique
async function sendVerificationEmail(email, firstName) {
  const token = crypto.randomBytes(32).toString("hex")
  await prisma.token.create(...)
  const url = buildUrl(token)
  const html = await render(...)
  await resend.send(...)
  return { success: true }
}

// ✅ BON : Workflow orchestrant des opérations unitaires
async function sendVerificationWorkflow(email, firstName) {
  const token = await generateToken()
  await saveVerificationToken(email, token, EXPIRES_IN)
  const url = buildVerificationUrl(token)
  const html = await renderVerificationEmail(url, firstName)
  await sendVerificationEmail(email, html)
  return { success: true }
}
```

## 🚫 Règles critiques

### Règle 1 : Un seul EmailLayout

**INTERDICTION** de créer plusieurs layouts.

```tsx
// ✅ BON : Un seul layout réutilisable
// email/templates/EmailLayout.tsx
export const EmailLayout = ({ children, previewText }) => (
  <Html>
    <Head>
      <Preview>{previewText}</Preview>
    </Head>
    <Body style={body}>
      <Container style={container}>
        {/* Header standard */}
        <Section style={header}>
          <Img src="/logo.png" alt="Logo" />
        </Section>

        {/* Contenu variable */}
        {children}

        {/* Footer standard */}
        <Section style={footer}>
          <Text>© {new Date().getFullYear()} - Tous droits réservés</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

// ❌ INTERDIT : Créer un second layout
// email/templates/AlternativeLayout.tsx
```

**Pourquoi cette règle ?**
- ✅ Cohérence visuelle garantie sur tous les emails
- ✅ Modifications centralisées (header, footer, styles)
- ✅ Facilite la maintenance et l'évolution
- ❌ Multiples layouts = divergence de branding

### Règle 2 : Largeur maximale 600px

**TOUJOURS** respecter 600px pour le container principal.

```tsx
// ✅ BON
const container = {
  maxWidth: '600px',
  margin: '0 auto',
}

// ❌ INTERDIT : Largeurs non standard
const container = {
  maxWidth: '800px',  // Trop large
  maxWidth: '100%',   // Problèmes preview panes
}
```

**Pourquoi cette règle ?**
- Standard optimal pour compatibilité multi-clients
- Affichage correct dans preview panes (Gmail, Outlook)
- Mobile-friendly (scales bien sur petits écrans)

### Règle 3 : Table-based layout obligatoire

**UTILISER** `<table>` au lieu de `<div>` pour la structure.

```tsx
// ✅ BON : Table-based
<Section style={box}>
  <table>
    <tr>
      <td style={cell}>Contenu</td>
    </tr>
  </table>
</Section>

// ❌ INTERDIT : Div-based
<div style={box}>
  <div style={cell}>Contenu</div>
</div>
```

**Pourquoi cette règle ?**
- Meilleure compatibilité avec Outlook (rendering engine Word)
- Garantit structure stable même avec styles supprimés
- Standard email depuis 20 ans

### Règle 4 : Styles inline obligatoires

**JAMAIS** utiliser `<style>` tags dans `<head>`.

```tsx
// ✅ BON : Styles inline
<Text style={{
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '0 0 16px',
}}>
  Contenu
</Text>

// ❌ INTERDIT : Style tags
<style>
  .text {
    font-size: 16px;
    line-height: 26px;
  }
</style>
<Text className="text">Contenu</Text>
```

**Pourquoi cette règle ?**
- `<style>` tags supprimés par Gmail, Yahoo, etc.
- Styles inline garantis de fonctionner partout
- React Email convertit automatiquement les objets style

### Règle 5 : Alt text obligatoire

**TOUJOURS** fournir `alt` pour les images.

```tsx
// ✅ BON
<Img
  src="https://example.com/logo.png"
  alt="Logo Entreprise"
  width="48"
  height="48"
/>

// ❌ INTERDIT : Pas d'alt text
<Img src="https://example.com/logo.png" />
```

**Pourquoi cette règle ?**
- Accessibilité (lecteurs d'écran)
- Images désactivées par défaut dans beaucoup de clients
- Améliore score délivrabilité (Mail-Tester)

## 📝 Standards de design

### Hiérarchie typographique

```typescript
const heading = {
  fontSize: '28px',
  fontWeight: '700',
  textAlign: 'center' as const,
  color: '#111827',
  margin: '0 0 24px',
}

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '0 0 16px',
}

const textSecondary = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#6b7280',
  margin: '0 0 12px',
}
```

### Boutons CTA (Call-to-Action)

**Standards obligatoires** :

```typescript
const button = {
  backgroundColor: '#ea580c', // Couleur primaire
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  borderRadius: '8px',
  padding: '14px 40px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  minHeight: '44px', // Zone tappable mobile
}
```

**Texte CTA** :
- ✅ Court et impératif : "Confirmer", "Voir l'étude", "Réinitialiser"
- ❌ Vague : "Cliquez ici", "En savoir plus"

### Palette de couleurs

**Définir dans `lib/constants.ts`** :

```typescript
export const EMAIL_COLORS = {
  primary: '#ea580c',      // CTA, liens importants
  text: '#374151',         // Texte principal
  textSecondary: '#6b7280', // Texte secondaire
  background: '#f6f9fc',   // Background body
  containerBg: '#ffffff',  // Background container
  border: '#e5e7eb',       // Bordures
  footer: '#f9fafb',       // Background footer
}
```

### Ratio contenu

**60% texte / 40% visuel** :
- Améliore délivrabilité (évite filtres spam)
- Meilleure expérience si images désactivées
- Plus accessible

## 🎨 Création d'un nouveau template

### Processus en 4 étapes

#### 1. Créer le fichier template

```tsx
// email/templates/MonNouveauEmail.tsx
import { EmailLayout } from './EmailLayout'
import { Button, Heading, Text } from '@react-email/components'

interface MonNouveauEmailProps {
  userName: string
  actionUrl: string
}

export const MonNouveauEmail = ({ userName, actionUrl }: MonNouveauEmailProps) => {
  return (
    <EmailLayout previewText="Texte de prévisualisation inbox">
      <Heading style={heading}>
        Bonjour {userName},
      </Heading>

      <Text style={text}>
        Contenu de votre email...
      </Text>

      <Button href={actionUrl} style={button}>
        Texte du Bouton
      </Button>

      <Text style={textSecondary}>
        Si le bouton ne fonctionne pas, copiez ce lien :
        <br />
        <a href={actionUrl} style={link}>{actionUrl}</a>
      </Text>
    </EmailLayout>
  )
}

// Styles inline (obligatoire)
const heading = { /* ... */ }
const text = { /* ... */ }
const button = { /* ... */ }
const textSecondary = { /* ... */ }
const link = { /* ... */ }
```

#### 2. Créer la fonction d'envoi

```typescript
// email/lib/emails/sendMonNouveauEmail.ts
"use server"

import { resend, EMAIL_FROM } from "@/email/lib/resend"

export async function sendMonNouveauEmail(
  to: string,
  html: string
): Promise<void> {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Sujet de l'email",
    html,
    tags: [
      { name: "type", value: "mon-type" },
    ],
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }
}
```

#### 3. Créer la fonction de render

```typescript
// email/lib/emails/renderMonNouveauEmail.ts
import { render } from "@react-email/render"
import { MonNouveauEmail } from "@/email/templates/MonNouveauEmail"

export async function renderMonNouveauEmail(
  userName: string,
  actionUrl: string
): Promise<string> {
  return await render(
    MonNouveauEmail({ userName, actionUrl })
  )
}
```

#### 4. Créer le workflow d'orchestration

```typescript
// email/lib/workflows/monNouveauWorkflow.ts
"use server"

import { renderMonNouveauEmail } from "../emails/renderMonNouveauEmail"
import { sendMonNouveauEmail } from "../emails/sendMonNouveauEmail"

export async function monNouveauWorkflow(
  email: string,
  userName: string,
  actionUrl: string
): Promise<{ success: boolean }> {
  const html = await renderMonNouveauEmail(userName, actionUrl)
  await sendMonNouveauEmail(email, html)
  return { success: true }
}
```

## ✅ Checklist avant envoi

### Contenu

- [ ] Preview text informatif (< 100 caractères)
- [ ] Un seul H1 (heading principal)
- [ ] Hiérarchie logique (h1 → h2 → h3)
- [ ] Ratio 60% texte / 40% visuel
- [ ] Aucun mot spam ("gratuit", "urgent", "!!!")
- [ ] Liens HTTPS uniquement
- [ ] Liens ne pointent PAS vers localhost

### Design

- [ ] Layout utilise EmailLayout
- [ ] Container max-width: 600px
- [ ] Table-based layout (pas de div)
- [ ] Styles inline (pas de `<style>` tags)
- [ ] Alt text sur toutes les images
- [ ] Bouton CTA min-height: 44px
- [ ] Police min-size: 16px (corps de texte)
- [ ] Contraste WCAG AA (4.5:1 minimum)

### Technique

- [ ] NEXTAUTH_URL configuré en production
- [ ] RESEND_API_KEY valide
- [ ] EMAIL_FROM = adresse vérifiée
- [ ] Sujet < 50 caractères
- [ ] Template testé avec react-email preview
- [ ] Props TypeScript bien typées

### Délivrabilité

- [ ] SPF configuré
- [ ] DKIM configuré
- [ ] DMARC configuré (p=quarantine minimum)
- [ ] Domaine vérifié dans Resend
- [ ] Score Mail-Tester > 8/10
- [ ] Pas de mots spam dans sujet/contenu

## 🚨 Anti-patterns à éviter

### ❌ Fichiers monolithiques

```typescript
// ❌ MAUVAIS : Tout dans un fichier
// email/lib/emailVerification.ts (500 lignes)
export function generateToken() { /* ... */ }
export async function saveToken() { /* ... */ }
export async function validateToken() { /* ... */ }
export function buildUrl() { /* ... */ }
export async function sendEmail() { /* ... */ }
export async function verifyEmail() { /* ... */ }
```

```typescript
// ✅ BON : Séparation claire
// email/lib/tokens/generateToken.ts
// email/lib/tokens/saveVerificationToken.ts
// email/lib/tokens/findVerificationToken.ts
// email/lib/emails/buildVerificationUrl.ts
// email/lib/emails/sendVerificationEmail.ts
// email/lib/workflows/verifyEmailWorkflow.ts
```

### ❌ Layouts multiples

```tsx
// ❌ MAUVAIS : Plusieurs layouts
email/templates/
├── EmailLayout.tsx
├── AlternativeLayout.tsx
├── MinimalLayout.tsx
└── ...

// ✅ BON : Un seul layout
email/templates/
└── EmailLayout.tsx
```

### ❌ Styles externes

```tsx
// ❌ MAUVAIS
<style>
  .heading { font-size: 28px; }
</style>
<h1 className="heading">Titre</h1>

// ✅ BON
<Heading style={{ fontSize: '28px' }}>Titre</Heading>
```

### ❌ Div-based layout

```tsx
// ❌ MAUVAIS
<div style={container}>
  <div style={row}>
    <div style={column}>Contenu</div>
  </div>
</div>

// ✅ BON
<Section style={container}>
  <table>
    <tr>
      <td style={column}>Contenu</td>
    </tr>
  </table>
</Section>
```

### ❌ Images sans alt text

```tsx
// ❌ MAUVAIS
<Img src="/logo.png" width="48" height="48" />

// ✅ BON
<Img
  src="/logo.png"
  alt="Logo Entreprise"
  width="48"
  height="48"
/>
```

### ❌ Liens localhost en production

```tsx
// ❌ MAUVAIS
const url = `http://localhost:3000/verify?token=${token}`

// ✅ BON
const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const url = `${baseUrl}/verify?token=${token}`
```

## 📚 Ressources

### Documentation

- [Resend Docs](https://resend.com/docs)
- [React Email Docs](https://react.email/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Can I Email](https://www.caniemail.com/) - Support CSS dans emails

### Outils de test

- [Mail Tester](https://www.mail-tester.com/) - Score délivrabilité
- [MXToolbox](https://mxtoolbox.com/) - Vérification DNS
- [Email on Acid](https://www.emailonacid.com/) - Test multi-clients

### Standards

- [RFC 7208 - SPF](https://datatracker.ietf.org/doc/html/rfc7208)
- [RFC 6376 - DKIM](https://datatracker.ietf.org/doc/html/rfc6376)
- [RFC 7489 - DMARC](https://datatracker.ietf.org/doc/html/rfc7489)

---

**Version** : 1.0
**Dernière mise à jour** : 3 décembre 2024

**IMPORTANT** : Ces directives sont permanentes et s'appliquent à TOUS les emails transactionnels, quelle que soit leur nature ou leur destination.
