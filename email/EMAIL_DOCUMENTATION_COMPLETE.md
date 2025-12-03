# Documentation Complète - Système Email ThermoGain

**Version :** 1.0
**Dernière mise à jour :** Décembre 2025
**Statut :** Phase 1 Opérationnelle

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Connaissances - Bonnes Pratiques](#connaissances---bonnes-pratiques)
3. [Architecture et Fonctionnement](#architecture-et-fonctionnement)
4. [Délivrabilité et Configuration](#délivrabilité-et-configuration)
5. [Guide d'Utilisation](#guide-dutilisation)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

### Système Email ThermoGain

ThermoGain utilise **Resend** avec **React Email** pour gérer tous ses emails transactionnels :
- ✅ Vérification d'email (inscription)
- ✅ Réinitialisation de mot de passe
- ✅ Envoi des résultats d'étude PAC
- ✅ Notifications de contact

**Technologies utilisées :**
- **Resend** (v6.5.2) : Service d'envoi d'emails transactionnels
- **React Email** (@react-email/components v1.0.1) : Framework pour templates HTML
- **Next.js 14** : Intégration avec Server Actions

**Quotas Resend (Plan Gratuit) :**
- 3,000 emails/mois (100/jour)
- Suffisant pour ~100 projets/mois
- Upgrade à $20/mois pour 50,000 emails

---

## 📚 Connaissances - Bonnes Pratiques

### 1. Structure et Layout Email

#### Largeur Optimale
- **600px** : Largeur maximale du container
- Standard optimal pour compatibilité multi-clients email
- Garantit un affichage correct dans les preview panes

#### Architecture HTML
**Table-based layout obligatoire :**
- Utilisation de `<table>` au lieu de `<div>`
- Meilleure compatibilité avec clients email (notamment Outlook)
- **Styles inline** pour éviter la suppression des `<style>` tags
- Les `<style>` tags dans `<head>` sont supprimés par certains clients

#### Design Mobile-First
- Boutons de minimum **44px de hauteur** (zone tappable)
- Police de **16px minimum** pour le corps du texte
- Layout en colonne unique pour mobile
- Media queries pour responsive (mais limité support)

### 2. Design et UX

#### Hiérarchie Typographique
```
Titre (H1)       : 28px, bold, centré
Corps de texte   : 16px, line-height 26px
Texte secondaire : 14px, line-height 22px
```

#### Palette de Couleurs ThermoGain
```
CTA principal    : #ea580c (Orange ThermoGain)
Texte principal  : #374151 (Gris foncé)
Texte secondaire : #6b7280 (Gris moyen)
Background       : #f6f9fc (Gris très clair)
Footer BG        : #f9fafb (Gris plus clair)
```

#### Call-to-Action (CTA)
**Bonnes pratiques :**
- Couleur contrastée (#ea580c)
- Padding généreux (14px 40px)
- Border-radius 8px
- Font-weight 600
- Min-height 44px pour mobile
- Texte court et impératif ("Confirmer", "Voir l'étude")

#### Ratio Contenu
**60% texte / 40% visuel**
- Améliore la délivrabilité
- Évite les filtres anti-spam
- Meilleure expérience si images désactivées

### 3. Ligne de Sujet

#### Règles d'Or
**Longueur optimale :**
- **6-10 mots** idéal
- **< 50 caractères** (< 42 pour mobile)
- Message complet même si tronqué

**Structure efficace :**
- Action en début de ligne
- Valeur claire et immédiate
- Pas de clickbait

**Exemples ThermoGain :**
- ✅ "Confirmez votre email ThermoGain" (35 car)
- ✅ "Votre étude PAC est prête" (28 car)
- ✅ "Réinitialisez votre mot de passe - Expire dans 1h"
- ❌ "Action requise concernant votre compte" (trop vague)
- ❌ "🎉 Vous n'allez pas croire ce qui vous attend !" (spam)

#### Éviter les Spam Triggers
**Mots à éviter :**
- "Gratuit", "Urgent", "Dernière chance"
- "€€€", "$$$", multiples "!!!"
- "100% garanti", "Pas de spam"
- Trop de majuscules

### 4. Accessibilité

#### Alt Text Obligatoire
```tsx
<Img
  src="https://thermogain.fr/logo.png"
  alt="ThermoGain Logo"
  width="48"
  height="48"
/>
```

#### Contraste WCAG 2.1 AA
- Ratio 4.5:1 pour texte normal
- Ratio 3:1 pour texte large (18px+)

#### Structure Sémantique
- Un seul `<h1>` par email
- Hiérarchie logique (h1 → h2 → h3)
- Liens descriptifs (éviter "cliquez ici")

### 5. Délivrabilité - Métriques Clés

**Taux d'ouverture (2025) :**
- Moyenne : 37.93%
- Bon taux : > 40%
- ⚠️ iOS 15+ fausse les stats (auto-load)

**Taux de clic (CTR) :**
- Moyenne : 2-5%
- Bon taux : > 3%

**Taux de bounce :**
- Hard bounce : < 2% (emails invalides)
- Soft bounce : < 5% (boîtes pleines)

**Taux de spam :**
- Cible : < 0.1%
- Au-dessus de 0.3% : problème sérieux

---

## 🏗 Architecture et Fonctionnement

### Structure du Dossier `/email`

```
email/
├── resend.ts                           # Configuration Resend
├── lib/
│   └── email-verification.ts           # Logique vérification email
├── templates/
│   ├── email-layout.tsx                # Layout réutilisable
│   ├── verification-email.tsx          # Email d'inscription
│   ├── password-reset-email.tsx        # Reset mot de passe
│   ├── study-results-email.tsx         # Résultats d'étude PAC
│   ├── contact-notification-email.tsx  # Notification contact
│   └── contact-confirmation-email.tsx  # Confirmation contact
└── [Documentation]
    ├── EMAIL_BEST_PRACTICES.md
    ├── GUIDE_ENVOI_RESULTATS.md
    ├── PHASE_1_COMPLETE.md
    └── EMAIL_DOCUMENTATION_COMPLETE.md (ce fichier)
```

### Configuration Resend

**Fichier :** `email/resend.ts`

```typescript
import { Resend } from 'resend'

// Vérification API Key
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set')
}

// Instance Resend
export const resend = new Resend(process.env.RESEND_API_KEY)

// Configuration
export const EMAIL_FROM = 'ThermoGain <contact@thermogain.fr>'
export const EMAIL_VERIFICATION_EXPIRES_IN = 24 * 60 * 60 * 1000 // 24h
```

**Variables d'environnement requises :**
```bash
# .env
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXTAUTH_URL=https://thermogain.fr  # CRITIQUE pour les liens
```

### Layout Email Réutilisable

**Fichier :** `email/templates/email-layout.tsx`

**Structure :**
```
┌────────────────────────────────┐
│  Header (logo + nom marque)    │  ← Blanc, border-bottom gris
├────────────────────────────────┤
│  Contenu (children)            │  ← Padding 32px
├────────────────────────────────┤
│  Footer                        │  ← Gris clair, copyright + liens
│  - Copyright                   │
│  - Contact · Mentions légales  │
│  - Politique confidentialité   │
└────────────────────────────────┘
```

**Caractéristiques techniques :**
- Largeur max : 600px
- Background : #ffffff (container) + #f6f9fc (body)
- Border : 1px solid #e5e7eb
- Styles inline pour compatibilité maximale
- Font-family : system fonts (-apple-system, Roboto, etc.)

**Props :**
```typescript
interface EmailLayoutProps {
  children: React.ReactNode
  previewText: string  // Texte de prévisualisation (inbox)
}
```

### Templates Email Disponibles

#### 1. Vérification Email (`verification-email.tsx`)

**Usage :** Inscription utilisateur

**Contenu :**
- Message de bienvenue personnalisé (prénom)
- Explication validation 24h
- Bouton CTA "Confirmer mon adresse email"
- Texte alternatif avec lien cliquable

**Server Action :** `email/lib/email-verification.ts`
```typescript
export async function sendVerificationEmail(
  email: string,
  firstName: string,
  token: string
)
```

**Sujet :** "Confirmez votre email ThermoGain"

#### 2. Réinitialisation Mot de Passe (`password-reset-email.tsx`)

**Usage :** Mot de passe oublié

**Contenu :**
- Contexte (demande de réinitialisation)
- Bouton CTA "Réinitialiser mon mot de passe"
- Expiration 1 heure
- Message sécurité (ignorer si non demandé)

**Server Action :** `lib/actions/password-reset.ts`
```typescript
export async function requestPasswordReset(email: string)
```

**Sujet :** "Réinitialisez votre mot de passe ThermoGain"

#### 3. Résultats d'Étude PAC (`study-results-email.tsx`)

**Usage :** Envoi des résultats après complétion projet

**Structure complète :**
```
1. Message d'introduction personnalisé
2. Encadré "Étude réalisée avec [Professionnel]" (si renseigné)
3. Synthèse financière :
   - Investissement (coût total, aides, reste à charge)
   - Économies (annuelles, ROI, bénéfice net)
4. Bouton CTA "Voir l'étude complète"
5. Liste des éléments inclus dans l'étude
6. Mentions légales (4 paragraphes)
```

**Mise en avant du professionnel :**
- Si `company` renseigné → Affiche entreprise en grand
- Si `firstName + lastName` → Affiche nom complet
- Si les deux → Entreprise + nom en sous-titre
- Si aucun → Pas d'encadré

**Mentions légales protectrices :**
1. **Nature de l'étude** : Simulation indicative, non contractuelle
2. **Non-engagement** : Ni ThermoGain ni [professionnel] ne s'engagent
3. **Recommandation** : Consulter un RGE pour audit professionnel
4. **Aides financières** : Montants indicatifs, soumis à conditions

**Server Action :** `lib/actions/send-study-results.ts`
```typescript
export async function sendStudyResults(
  projectId: string,
  userId: string
)
```

**Sujet :** "Votre étude PAC : {économiesAnnuelles}€ d'économies/an"

**Tags Resend :**
- `type: study-results`
- `project_id: [projectId]`

### Composants UI Associés

#### SendResultsButton

**Fichier :** `app/(main)/projects/[projectId]/results/components/SendResultsButton.tsx`

**États UX :**
- `idle` : Bouton normal "Recevoir par email"
- `loading` : "Envoi en cours..." + spinner
- `success` : "Email envoyé !" + checkmark vert
- `error` : Message d'erreur + alert rouge

**Feedback visuel :**
- Alert de succès (vert) : auto-disparaît après 5s
- Alert d'erreur (rouge) : reste visible
- Bouton désactivé pendant envoi

**Props :**
```typescript
interface SendResultsButtonProps {
  projectId: string
  userId: string
  userEmail: string
}
```

### Flux d'Envoi Email (Exemple : Résultats)

```
1. User clique "Recevoir par email"
   └─> SendResultsButton onChange

2. Client Component appelle Server Action
   └─> sendStudyResults(projectId, userId)

3. Server Action valide et récupère données
   ├─> Vérification : user === project.userId
   ├─> Vérification : project.completed === true
   └─> Calcul des résultats financiers

4. Render du template React Email
   └─> <StudyResultsEmail {...props} />

5. Conversion HTML par @react-email/render
   └─> render(template)

6. Envoi via Resend API
   └─> resend.emails.send({
         from: EMAIL_FROM,
         to: user.email,
         subject: "...",
         html: htmlContent,
         tags: [...]
       })

7. Resend retourne messageId
   └─> Success/Error renvoyé au client

8. Client affiche feedback UX
   └─> Alert + changement état bouton
```

---

## 🔐 Délivrabilité et Configuration

### Authentification Email (CRITIQUE)

**3 protocoles obligatoires pour éviter le spam :**

#### 1. SPF (Sender Policy Framework)
**Rôle :** Autorise Resend à envoyer des emails depuis votre domaine

**Enregistrement DNS :**
```
Type : TXT
Host : @
Value : v=spf1 include:_spf.resend.com ~all
TTL : 3600
```

**Vérification :**
```bash
dig +short TXT thermogain.fr | grep spf
# Attendu : "v=spf1 include:_spf.resend.com ~all"
```

#### 2. DKIM (DomainKeys Identified Mail)
**Rôle :** Signature cryptographique prouvant l'authenticité

**Enregistrement DNS :**
```
Type : CNAME
Host : resend._domainkey
Value : resend._domainkey.resend.com
TTL : 3600
```

**Vérification :**
```bash
dig +short CNAME resend._domainkey.thermogain.fr
# Attendu : "resend._domainkey.resend.com"
```

#### 3. DMARC (Domain-based Message Authentication)
**Rôle :** Politique de traitement des emails non authentifiés

**Enregistrement DNS :**
```
Type : TXT
Host : _dmarc
Value : v=DMARC1; p=quarantine; rua=mailto:dmarc@thermogain.fr
TTL : 3600
```

**Vérification :**
```bash
dig +short TXT _dmarc.thermogain.fr
# Attendu : "v=DMARC1; p=quarantine; rua=mailto:dmarc@thermogain.fr"
```

### Configuration Resend Dashboard

**Étapes :**
1. Se connecter à https://resend.com/domains
2. Ajouter le domaine `thermogain.fr`
3. Copier les enregistrements DNS fournis
4. Les ajouter chez votre registrar de domaine
5. Attendre propagation (2-48h, généralement 2-4h)
6. Vérifier statut "Verified" ✅ dans Resend

### Domain Warming (ESSENTIEL)

**Problème :** Domaine neuf = score de réputation 0 = spam

**Solution :** Augmentation progressive du volume d'envoi

**Planning sur 6 semaines :**

| Période | Volume/jour | Cible | Actions |
|---------|------------|-------|---------|
| Semaine 1-2 | 50-100 | Nouveaux inscrits uniquement | Monitoring strict |
| Semaine 3-4 | 200-500 | Utilisateurs actifs (<30j) | Vérifier bounces |
| Semaine 5-6 | 1000-2000 | Tous utilisateurs engagés | Nettoyer inactifs |
| Semaine 7+ | Illimité | Tous utilisateurs | Maintenance |

**⚠️ NE JAMAIS envoyer massivement dès le début !**

**Objectifs d'engagement :**
- Taux d'ouverture : > 20%
- Taux de clic : > 2%
- Taux de bounce : < 2%
- Taux de spam complaint : < 0.1%

### Bonnes Pratiques de Contenu

**À FAIRE ✅ :**
- Ratio texte/image équilibré (60/40)
- Liens HTTPS uniquement
- Alt text sur toutes les images
- Adresse d'envoi répondable (contact@, pas noreply@)
- Lien de désabonnement (même transactionnel)
- Preview text informatif
- Sujets clairs et courts

**À ÉVITER ❌ :**
- Mots spam : "gratuit", "urgent", "gagnez"
- Trop de majuscules ou points d'exclamation
- Pièces jointes non sollicitées
- URLs raccourcies (bit.ly, etc.)
- Images sans alt text
- Liens vers localhost (NEXTAUTH_URL mal configuré)

### Outils de Test et Monitoring

#### Avant Production

**1. Mail Tester** : https://www.mail-tester.com
- Envoyer un email de test à leur adresse
- Obtenir score /10 (cible : > 8/10)
- Diagnostics détaillés

**2. SpamAssassin** : check@spamcheck.postmarkapp.com
- Envoyer email de test
- Recevoir analyse complète des flags spam

**3. Email Headers Check**
- Gmail : Menu ⋮ → "Show original"
- Rechercher : `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`

#### Monitoring Continu

**Dashboard Resend** : https://resend.com/emails
- Delivered (> 98%)
- Opened (> 20%)
- Clicked (> 2%)
- Bounced (< 2%)
- Complaints (< 0.1%)

**Google Postmaster Tools** : https://postmaster.google.com
- Ajouter domaine
- Voir réputation Gmail
- Alerts spam automatiques

**MXToolbox** : https://mxtoolbox.com/emailhealth
- Vérifier santé DNS
- Blacklist monitoring
- Email health score

### Checklist Configuration Complète

#### DNS et Authentification
- [ ] SPF configuré et vérifié (dig TXT thermogain.fr)
- [ ] DKIM configuré et vérifié (dig CNAME resend._domainkey)
- [ ] DMARC configuré avec p=quarantine minimum
- [ ] Domaine "Verified" ✅ sur Resend Dashboard
- [ ] Test headers : SPF=PASS, DKIM=PASS, DMARC=PASS

#### Variables d'Environnement
- [ ] RESEND_API_KEY configuré (.env)
- [ ] NEXTAUTH_URL=https://thermogain.fr (production)
- [ ] Liens dans emails pointent vers domaine principal
- [ ] Pas de liens vers localhost

#### Contenu Email
- [ ] Adresse d'envoi : contact@thermogain.fr
- [ ] Sujets optimisés (< 50 caractères)
- [ ] Preview text informatif
- [ ] Lien de désabonnement dans footer
- [ ] Alt text sur toutes les images
- [ ] Ratio texte/image respecté (60/40)
- [ ] Aucun mot spam flagrant

#### Tests
- [ ] Score Mail-Tester > 8/10
- [ ] SpamAssassin : pas de flags critiques
- [ ] Test Gmail, Outlook, Apple Mail
- [ ] Test responsive mobile
- [ ] Test tous les types d'emails

#### Domain Warming
- [ ] Plan de warming sur 6 semaines établi
- [ ] Semaine 1-2 : max 50-100/jour
- [ ] Surveillance quotidienne métriques
- [ ] Taux de bounce < 2%
- [ ] Taux de complaints < 0.1%

---

## 📖 Guide d'Utilisation

### Envoyer un Email de Résultats

**Contexte :** User a complété son projet et veut recevoir les résultats par email

**Page :** `/projects/[projectId]/results`

**Étapes :**

1. **User clique sur bouton "Recevoir par email"**
   - Composant : `SendResultsButton`
   - Props : projectId, userId, userEmail

2. **Client Component appelle Server Action**
   ```typescript
   const result = await sendStudyResults(projectId, userId)
   ```

3. **Server Action valide et envoie**
   - Vérification : user === project owner
   - Vérification : project.completed === true
   - Calcul des résultats financiers
   - Render template email
   - Envoi via Resend

4. **Feedback UX affiché**
   - Success : Alert verte + "Email envoyé !"
   - Erreur : Alert rouge + message d'erreur

**Temps de réponse :** 2-3 secondes

**Email reçu contient :**
- Nom/entreprise du professionnel (si renseigné)
- Résultats financiers (investissement, aides, économies, ROI)
- Bouton "Voir l'étude complète" (lien vers résultats)
- Mentions légales complètes

### Créer un Nouveau Template Email

**Étapes :**

1. **Créer le fichier template**
   ```bash
   touch email/templates/mon-nouveau-email.tsx
   ```

2. **Utiliser le layout**
   ```tsx
   import { EmailLayout } from './email-layout'
   import { Button, Heading, Text } from '@react-email/components'

   interface MonEmailProps {
     userName: string
     // ... autres props
   }

   export const MonEmail = ({ userName }: MonEmailProps) => {
     return (
       <EmailLayout previewText="Texte de prévisualisation">
         <Heading style={heading}>
           Bonjour {userName},
         </Heading>

         <Text style={text}>
           Contenu de votre email...
         </Text>

         <Button
           href="https://thermogain.fr/action"
           style={button}
         >
           Bouton d'Action
         </Button>
       </EmailLayout>
     )
   }

   // Styles inline
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

   const button = {
     backgroundColor: '#ea580c',
     color: '#ffffff',
     fontSize: '16px',
     fontWeight: '600',
     borderRadius: '8px',
     padding: '14px 40px',
     textDecoration: 'none',
     textAlign: 'center' as const,
     display: 'inline-block',
   }
   ```

3. **Créer la Server Action**
   ```typescript
   // lib/actions/mon-action.ts
   'use server'

   import { render } from '@react-email/render'
   import { resend, EMAIL_FROM } from '@/email/resend'
   import { MonEmail } from '@/email/templates/mon-nouveau-email'

   export async function envoyerMonEmail(
     destinataire: string,
     userName: string
   ) {
     try {
       const htmlContent = await render(
         <MonEmail userName={userName} />
       )

       const { data, error } = await resend.emails.send({
         from: EMAIL_FROM,
         to: destinataire,
         subject: 'Mon Sujet Email',
         html: htmlContent,
         tags: [
           { name: 'type', value: 'mon-type' },
         ],
       })

       if (error) {
         throw new Error(error.message)
       }

       return { success: true, messageId: data.id }
     } catch (error) {
       console.error('[envoyerMonEmail] Error:', error)
       return { success: false, error: 'Échec envoi email' }
     }
   }
   ```

4. **Tester le template**
   ```bash
   # Preview en développement
   npm run email:dev

   # Envoyer un test
   # Utiliser la Server Action depuis un composant ou API route
   ```

### Monitoring des Emails Envoyés

**Dashboard Resend :**
1. Se connecter à https://resend.com/emails
2. Voir liste des emails avec statut :
   - ✅ Delivered : Email délivré
   - 📧 Opened : Email ouvert
   - 🔗 Clicked : Lien cliqué
   - ⚠️ Bounced : Email rejeté
   - 🚫 Complained : Marqué spam

**Filtrage par tags :**
- `type: study-results`
- `type: verification`
- `type: password-reset`
- `project_id: [id]`

**Métriques globales :**
- Taux de délivrance (Delivery Rate)
- Taux d'ouverture (Open Rate)
- Taux de clic (Click Rate)
- Taux de bounce (Bounce Rate)
- Taux de complaints (Complaint Rate)

**Alertes à configurer :**
- Bounce > 5% → Nettoyer liste emails
- Complaints > 0.5% → Revoir contenu
- Domaine blacklisté → Contacter Resend support

---

## 🛠 Troubleshooting

### Email Non Reçu

**1. Vérifier les logs serveur**
```bash
# Console terminal (npm run dev)
# Rechercher : [sendStudyResults] Email sent successfully
```

**2. Vérifier Resend Dashboard**
- https://resend.com/emails
- Chercher l'email par destinataire
- Status : delivered / bounced / failed
- Si bounced : vérifier adresse email valide

**3. Vérifier dossier spam**
- Checker spam/courrier indésirable
- Si spam : problème d'authentification DNS

**4. Vérifier les headers**
- Gmail : Menu ⋮ → "Show Original"
- Rechercher `Authentication-Results`
- Vérifier : SPF=PASS, DKIM=PASS, DMARC=PASS
- Si FAIL : configuration DNS incorrecte

### Email en Spam

**Causes possibles :**

**1. Authentification DNS manquante**
- Vérifier SPF, DKIM, DMARC configurés
- Attendre propagation DNS (2-48h)
- Tester avec dig (commandes dans section DNS)

**2. Domaine neuf sans réputation**
- Solution : Domain warming progressif
- Réduire volume d'envoi temporairement
- Augmenter progressivement sur 6 semaines

**3. Contenu suspect**
- Vérifier avec Mail-Tester (score < 8/10)
- Retirer mots spam du sujet/contenu
- Améliorer ratio texte/image
- Ajouter lien de désabonnement

**4. Domaine/IP blacklisté**
- Vérifier : https://mxtoolbox.com/blacklists.aspx
- Si blacklisté : contacter Resend support
- Demander removal (24-48h)

**5. Taux d'engagement faible**
- Améliorer sujets d'email (A/B testing)
- Nettoyer liste (retirer inactifs)
- Envoyer uniquement aux engagés

### Erreur "Cannot read properties of undefined (reading 'email')"

**Cause :** Relation `user` manquante dans la requête Prisma

**Solution :**
```typescript
// lib/actions/projects.ts
const project = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    user: true,  // ← AJOUTER CETTE LIGNE
    // ... autres includes
  },
})
```

### Erreur Resend API

**Erreur 401 Unauthorized**
- Cause : RESEND_API_KEY invalide ou manquant
- Solution : Vérifier `.env` et redémarrer serveur

**Erreur 403 Forbidden**
- Cause : Domaine non vérifié dans Resend
- Solution : Configurer DNS et vérifier domaine

**Erreur 422 Validation Error**
- Cause : Paramètres d'envoi invalides (to, from, subject)
- Solution : Vérifier format email destinataire
- Vérifier EMAIL_FROM bien configuré

### Liens dans Email Pointent vers Localhost

**Cause :** NEXTAUTH_URL non configuré en production

**Solution :**
```bash
# .env.production ou variables Vercel
NEXTAUTH_URL=https://thermogain.fr
```

**Vérification :**
```typescript
// email/lib/email-verification.ts
console.log('Base URL:', process.env.NEXTAUTH_URL)
// Doit afficher : https://thermogain.fr (pas localhost)
```

### Taux de Bounce Élevé (> 5%)

**Causes :**
1. Emails invalides dans la base
2. Domaines inexistants
3. Boîtes pleines (soft bounce)

**Solutions :**
1. Valider emails à l'inscription
2. Double opt-in (email de vérification)
3. Nettoyer bounces automatiquement
4. Retirer emails après 3 bounces

**Code de nettoyage :**
```typescript
// Exemple : Retirer emails avec bounces
const hardBounces = await resend.bounces.list({
  type: 'hard',
})

// Marquer comme invalides dans la DB
```

### Score Mail-Tester Faible (< 8/10)

**Étapes de diagnostic :**

1. **Envoyer email de test**
   - https://www.mail-tester.com
   - Copier l'adresse fournie
   - Envoyer un email de test à cette adresse
   - Consulter le rapport

2. **Analyser les problèmes**
   - Authentication (SPF/DKIM/DMARC)
   - Content (spam words, ratio texte/image)
   - Technical (HTML validation, liens cassés)
   - Blacklists (domaine/IP)

3. **Corriger par priorité**
   - Rouge (critique) : Authentification, blacklists
   - Orange (important) : Contenu, technical
   - Jaune (mineur) : Optimisations

4. **Re-tester après corrections**
   - Attendre propagation DNS si changements
   - Envoyer nouveau test
   - Cible : score > 8/10

---

## 📊 Annexes

### Récapitulatif des Fichiers Créés (Phase 1)

**Nouveaux fichiers :**
- `email/templates/study-results-email.tsx` (482 lignes)
- `lib/actions/send-study-results.ts` (293 lignes)
- `app/(main)/projects/[projectId]/results/components/SendResultsButton.tsx` (78 lignes)

**Fichiers modifiés :**
- `lib/actions/projects.ts` (+1 ligne : user: true)
- `app/(main)/projects/[projectId]/results/components/ResultsHeader.tsx` (refactor)
- `app/(main)/projects/[projectId]/results/page.tsx` (ajout props)

**Total :** 3 nouveaux fichiers, 3 fichiers modifiés

### Types d'Emails Disponibles

| Type | Template | Server Action | Usage |
|------|----------|---------------|-------|
| Vérification email | verification-email.tsx | email-verification.ts | Inscription |
| Reset mot de passe | password-reset-email.tsx | password-reset.ts | Mot de passe oublié |
| Résultats étude PAC | study-results-email.tsx | send-study-results.ts | Envoi résultats |
| Contact notification | contact-notification-email.tsx | N/A | Notification admin |
| Contact confirmation | contact-confirmation-email.tsx | N/A | Confirmation user |

### Variables d'Environnement Complètes

```bash
# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx

# NextAuth (CRITIQUE pour liens emails)
NEXTAUTH_URL=https://thermogain.fr
NEXTAUTH_SECRET=xxxxxxxxxxxxxxxx

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

### Ressources Externes

**Documentation :**
- [Resend Docs](https://resend.com/docs)
- [React Email Docs](https://react.email/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

**Outils de Test :**
- [Mail Tester](https://www.mail-tester.com/)
- [MXToolbox](https://mxtoolbox.com/)
- [Can I Email](https://www.caniemail.com/)
- [Google Postmaster](https://postmaster.google.com/)

**Standards 2025 :**
- [RFC 7208 - SPF](https://datatracker.ietf.org/doc/html/rfc7208)
- [RFC 6376 - DKIM](https://datatracker.ietf.org/doc/html/rfc6376)
- [RFC 7489 - DMARC](https://datatracker.ietf.org/doc/html/rfc7489)

**Statistiques :**
- [Email Marketing Benchmarks 2025](https://www.omnisend.com/blog/email-marketing-statistics/)
- [Deliverability Best Practices](https://www.validity.com/blog/email-deliverability-best-practices/)

### Support et Aide

**Resend Support :**
- Email : support@resend.com
- Dashboard : https://resend.com/overview
- Status : https://status.resend.com
- Documentation : https://resend.com/docs

**En cas de problème urgent :**
1. Vérifier Dashboard Resend (statut emails)
2. Consulter cette documentation (Troubleshooting)
3. Tester avec outils (Mail-Tester, MXToolbox)
4. Contacter Resend support si problème technique

---

**Version :** 1.0
**Dernière mise à jour :** Décembre 2025
**Statut :** ✅ Phase 1 Opérationnelle

🎉 **Système email complet et documenté !**
