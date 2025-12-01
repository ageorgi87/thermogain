# 🔍 Analyse de Délivrabilité Email - ThermoGain

**Date d'analyse :** 1er décembre 2025
**Domaine :** thermogain.fr
**Service email :** Resend
**Problème identifié :** Emails système tombent dans les SPAM

---

## 📊 État Actuel de la Configuration

### ✅ Points Positifs

1. **Templates Email Professionnels**
   - Structure HTML propre avec `@react-email/components`
   - Layout cohérent avec header/footer
   - Boutons CTA bien dimensionnés (44px+ pour mobile)
   - Texte alternatif pour les liens
   - Messages de sécurité inclus

2. **Bonnes Pratiques de Contenu**
   - Personnalisation avec prénom utilisateur
   - Messages clairs et concis
   - Délais d'expiration explicites (24h, 1h)
   - Pas de mots spam flagrants
   - Ratio texte/image respecté

3. **Adresse d'Envoi Correcte**
   - ✅ Changement de `noreply@thermogain.fr` à `contact@thermogain.fr`
   - Permet les réponses (meilleure confiance)

### ❌ Problèmes Critiques Identifiés

#### 1. 🚨 **Authentification Email (CRITIQUE)**

**Statut actuel : PROBABLEMENT INCOMPLET**

Votre domaine `thermogain.fr` doit avoir configuré ces 3 protocoles obligatoires :

- **SPF** (Sender Policy Framework) : Autorise Resend à envoyer des emails depuis votre domaine
- **DKIM** (DomainKeys Identified Mail) : Signature cryptographique prouvant l'authenticité
- **DMARC** (Domain-based Message Authentication) : Politique de traitement des emails non authentifiés

**⚠️ Sans ces configurations, Gmail, Outlook, Yahoo rejettent automatiquement vos emails en SPAM.**

**Comment vérifier :**
```bash
# Vérifier SPF
dig TXT thermogain.fr

# Vérifier DKIM (Resend utilise généralement resend._domainkey)
dig TXT resend._domainkey.thermogain.fr

# Vérifier DMARC
dig TXT _dmarc.thermogain.fr
```

**Configuration attendue dans Resend Dashboard :**
1. Aller sur https://resend.com/domains
2. Vérifier que votre domaine est "Verified" (icône verte)
3. Les enregistrements DNS suivants doivent être ajoutés chez votre registrar :

```
Type: TXT
Host: @
Value: v=spf1 include:_spf.resend.com ~all

Type: CNAME
Host: resend._domainkey
Value: resend._domainkey.resend.com

Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@thermogain.fr
```

#### 2. 🆕 **Nouveau Domaine Sans Réputation**

**Problème :** Domaine tout neuf = score de réputation 0 = haute probabilité de spam

**Explications :**
- Les fournisseurs email (Gmail, Outlook) attribuent un score de réputation à chaque domaine
- Un nouveau domaine n'a aucun historique = suspect pour les filtres anti-spam
- Les spammeurs utilisent souvent des domaines jetables neufs

**Solutions :**

##### A. Domain Warming (Réchauffement de domaine) - ESSENTIEL

Vous devez progressivement augmenter votre volume d'envoi :

**Semaine 1-2 :** 50-100 emails/jour (seulement aux utilisateurs actifs)
**Semaine 3-4 :** 200-500 emails/jour
**Semaine 5-6 :** 1000-2000 emails/jour
**Semaine 7+ :** Volume normal

**⚠️ NE PAS envoyer massivement dès le début !**

##### B. Envoyer uniquement aux emails engagés

- Commencez par envoyer UNIQUEMENT aux utilisateurs qui se sont inscrits récemment
- Évitez d'envoyer à des listes anciennes ou importées
- Ne jamais acheter de listes d'emails

##### C. Maintenir un taux d'engagement élevé

Les emails doivent être ouverts et cliqués pour améliorer votre réputation :
- Taux d'ouverture cible : > 20%
- Taux de clic cible : > 2%
- Taux de spam complaint : < 0.1%
- Taux de bounce : < 2%

#### 3. 📧 **Sous-domaine vs Domaine Principal**

**Recommandation Resend :** Utiliser un sous-domaine pour les emails transactionnels

**Actuellement :** Vous envoyez depuis `contact@thermogain.fr` (domaine principal)

**Meilleure pratique :**
- Domaine marketing : `marketing.thermogain.fr` ou `news.thermogain.fr`
- Domaine transactionnel : `mail.thermogain.fr` ou `app.thermogain.fr`

**Avantages :**
- Si le marketing a des problèmes de réputation, les emails transactionnels ne sont pas impactés
- Meilleure séparation des types d'emails
- Réputation isolée

**Proposition :**
```typescript
// email/resend.ts
export const EMAIL_FROM = 'ThermoGain <contact@mail.thermogain.fr>'
```

Puis configurer `mail.thermogain.fr` dans Resend avec SPF/DKIM/DMARC séparés.

#### 4. 🔗 **URLs dans les Emails**

**Problème potentiel :** Les URLs de vérification/reset pointent-elles vers `thermogain.fr` ?

Vérifiez que :
- `process.env.NEXTAUTH_URL` est configuré avec `https://thermogain.fr` (pas localhost)
- Les liens dans vos emails pointent bien vers votre domaine principal
- Pas de redirections multiples (spam flags)

**Configuration actuelle à vérifier :**

```typescript
// email/email-verification.ts ligne 38
const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
const verificationUrl = `${baseUrl}/verify-email?token=${token}`
```

**⚠️ Si NEXTAUTH_URL n'est pas défini en production, les liens pointeront vers localhost = SPAM garanti !**

#### 5. 📝 **Contenu des Emails**

**Points à améliorer :**

##### A. Sujets d'email

Les sujets actuels sont bons mais peuvent être optimisés :

```typescript
// email-verification.ts
❌ Actuel : "Confirmez votre email ThermoGain"
✅ Meilleur : "Activez votre compte ThermoGain - Dernière étape"

// password-reset.ts
❌ Actuel : "Réinitialisez votre mot de passe ThermoGain"
✅ Meilleur : "Réinitialisez votre mot de passe - Expire dans 1h"
```

**Règles pour les sujets :**
- 40-50 caractères max (coupé sur mobile)
- Pas de MAJUSCULES excessives
- Pas de "!!!" ou "???"
- Inclure le nom de marque
- Créer de l'urgence (mais pas trop)

##### B. Texte Alternatif (Preview Text)

Bon usage actuel des `<Preview>` mais peut être amélioré :

```tsx
// email-verification.tsx ligne 37
<Preview>Confirmez votre email pour activer votre compte ThermoGain</Preview>

// Meilleur (ajouter contexte)
<Preview>Bienvenue sur ThermoGain ! Confirmez votre email pour commencer vos études thermiques.</Preview>
```

##### C. Balance Texte/Images

Actuellement excellent - vous utilisez principalement du texte avec peu d'images (logo uniquement).

**Ratio idéal respecté : 60% texte / 40% images**

#### 6. 🔐 **Lien de Désabonnement**

**⚠️ MANQUANT - CRITIQUE pour éviter le spam !**

Même pour les emails transactionnels, avoir un lien de désinscription améliore la confiance.

**À ajouter dans `email-layout.tsx` :**

```tsx
// Dans le footer
<Text style={footerLinks}>
  <a href="https://thermogain.fr/contact" style={link}>
    Contact
  </a>
  {' · '}
  <a href="https://thermogain.fr/legal/mentions-legales" style={link}>
    Mentions légales
  </a>
  {' · '}
  <a href="https://thermogain.fr/legal/politique-confidentialite" style={link}>
    Confidentialité
  </a>
  {' · '}
  <a href="https://thermogain.fr/unsubscribe" style={link}>
    Se désabonner
  </a>
</Text>
```

---

## 🎯 Plan d'Action Immédiat

### Phase 1 : Configuration Technique (Jour 1) ⚡ URGENT

#### 1.1 Vérifier l'Authentification DNS

**Action :** Aller sur le dashboard Resend et vérifier le statut du domaine

1. Se connecter à https://resend.com/domains
2. Vérifier que `thermogain.fr` apparaît avec un statut "Verified" ✅
3. Si "Pending" ou "Failed", cliquer sur le domaine pour voir les enregistrements DNS requis
4. Copier les enregistrements et les ajouter chez votre registrar de domaine

**Enregistrements DNS requis :**

| Type  | Host                | Value/Target                              | TTL  |
|-------|---------------------|-------------------------------------------|------|
| TXT   | @                   | v=spf1 include:_spf.resend.com ~all      | 3600 |
| CNAME | resend._domainkey   | resend._domainkey.resend.com             | 3600 |
| TXT   | _dmarc              | v=DMARC1; p=quarantine; rua=mailto:dmarc@thermogain.fr | 3600 |

**Temps de propagation :** 2-48h (généralement 2-4h)

**Commande de vérification :**
```bash
# Vérifier SPF
dig +short TXT thermogain.fr | grep spf

# Vérifier DKIM
dig +short CNAME resend._domainkey.thermogain.fr

# Vérifier DMARC
dig +short TXT _dmarc.thermogain.fr
```

#### 1.2 Configurer NEXTAUTH_URL en Production

**Fichier :** `.env.production` ou variables d'environnement Vercel

```bash
NEXTAUTH_URL=https://thermogain.fr
```

**⚠️ Sans cette config, tous vos liens pointent vers localhost !**

#### 1.3 Tester l'Envoi après Configuration DNS

Attendez 2-4h après l'ajout des DNS, puis testez :

1. Créer un nouveau compte de test
2. Envoyer email de vérification
3. Vérifier les headers de l'email reçu :
   - Gmail : Ouvrir l'email → Menu ⋮ → "Show original"
   - Rechercher `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`

### Phase 2 : Amélioration du Contenu (Jour 2-3)

#### 2.1 Ajouter un Lien de Désabonnement

**Fichier :** `email/templates/email-layout.tsx`

Ajouter dans le footer (après "Confidentialité") :

```tsx
{' · '}
<a href="https://thermogain.fr/unsubscribe" style={link}>
  Se désabonner
</a>
```

Créer la page `/unsubscribe` dans Next.js.

#### 2.2 Optimiser les Sujets d'Email

**Fichier :** `email/email-verification.ts`
```typescript
subject: 'Activez votre compte ThermoGain - Dernière étape',
```

**Fichier :** `lib/actions/password-reset.ts`
```typescript
subject: 'Réinitialisez votre mot de passe ThermoGain - Expire dans 1h',
```

#### 2.3 Améliorer les Preview Texts

**Fichier :** `email/templates/verification-email.tsx`
```tsx
<Preview>Bienvenue sur ThermoGain ! Un clic pour activer votre compte et créer vos études thermiques.</Preview>
```

**Fichier :** `email/templates/password-reset-email.tsx`
```tsx
<Preview>Cliquez sur le lien sécurisé pour réinitialiser votre mot de passe ThermoGain. Expire dans 1h.</Preview>
```

### Phase 3 : Domain Warming (Semaines 1-6) 🔥

**⚠️ ESSENTIEL pour construire la réputation !**

#### Semaine 1-2 : Démarrage Lent

**Volume :** 50-100 emails/jour MAX
**Cible :** Uniquement nouveaux utilisateurs qui s'inscrivent volontairement

**Actions :**
- Désactiver temporairement les invitations massives
- Tester uniquement avec vrais utilisateurs
- Monitorer taux d'ouverture

#### Semaine 3-4 : Augmentation Progressive

**Volume :** 200-500 emails/jour
**Cible :** Utilisateurs actifs (moins de 30 jours)

**Actions :**
- Élargir progressivement
- Vérifier les bounces et plaintes
- Ajuster si taux de spam > 0.1%

#### Semaine 5-6 : Montée en Charge

**Volume :** 1000-2000 emails/jour
**Cible :** Tous utilisateurs engagés

**Actions :**
- Continuer monitoring
- Nettoyer les emails inactifs
- Maintenir taux d'engagement élevé

#### Semaine 7+ : Volume Normal

**Volume :** Illimité (selon votre plan Resend)
**Cible :** Tous utilisateurs

**Actions :**
- Maintenir pratiques établies
- Surveillance continue de la réputation

### Phase 4 : Monitoring Continu 📈

#### 4.1 Métriques à Suivre (Dashboard Resend)

Surveillez quotidiennement :

- **Delivered** : Taux de délivrance (cible : > 98%)
- **Opened** : Taux d'ouverture (cible : > 20%)
- **Clicked** : Taux de clic (cible : > 2%)
- **Bounced** : Rebonds (cible : < 2%)
- **Complaints** : Plaintes spam (cible : < 0.1%)

#### 4.2 Outils de Test

**Avant de lancer en production, tester avec :**

1. **Mail-Tester** : https://www.mail-tester.com
   - Envoyer un email de test à leur adresse
   - Obtenir un score /10 (cible : > 8/10)

2. **Google Postmaster Tools** : https://postmaster.google.com
   - Ajouter votre domaine
   - Voir votre réputation auprès de Gmail

3. **MXToolbox** : https://mxtoolbox.com/emailhealth
   - Vérifier santé DNS/SPF/DKIM/DMARC

#### 4.3 Alertes à Configurer

**Sur Resend Dashboard :**
- Alerte si taux de bounce > 5%
- Alerte si complaints > 0.5%
- Alerte si domaine blacklisté

---

## 🆘 Actions d'Urgence si Emails Toujours en SPAM après Config

### Vérification 1 : Headers Email

Demander à un destinataire de :
1. Ouvrir l'email en SPAM
2. Afficher les headers complets ("Show Original" sur Gmail)
3. Rechercher :

```
Authentication-Results:
  spf=pass
  dkim=pass
  dmarc=pass
```

Si un de ces checks est "fail" ou "none", le problème vient de la config DNS.

### Vérification 2 : Blacklists

Vérifier si votre domaine ou IP Resend sont blacklistés :

https://mxtoolbox.com/blacklists.aspx

Si blacklisté :
1. Identifier la raison (abuse report, spam complaint)
2. Demander removal à Resend support
3. Attendre 24-48h

### Vérification 3 : Contenu Suspect

Vérifier avec SpamAssassin :
- Envoyer email de test à : check@spamcheck.postmarkapp.com
- Recevoir analyse détaillée des flags spam

### Solution Temporaire

Si urgent, envoyer les premiers emails importants via un service ayant déjà une bonne réputation :
- SendGrid (free tier : 100 emails/jour)
- Postmark (free trial)
- Utiliser en parallèle le temps que Resend se réchauffe

---

## 📚 Ressources Utiles

### Documentation Officielle

- **Resend Email Authentication** : https://resend.com/blog/email-authentication-a-developers-guide
- **Resend Deliverability Tips** : https://resend.com/blog/top-10-email-deliverability-tips
- **Why Emails Go to Spam** : https://resend.com/blog/why-your-emails-are-going-to-spam

### Outils de Test

- **Mail Tester** : https://www.mail-tester.com
- **MXToolbox** : https://mxtoolbox.com
- **Google Postmaster** : https://postmaster.google.com
- **Spamcheck (Postmark)** : check@spamcheck.postmarkapp.com

### Standards Email 2025

- **RFC 7208** : SPF Specification
- **RFC 6376** : DKIM Specification
- **RFC 7489** : DMARC Specification

---

## ✅ Checklist Complète

### Configuration Technique

- [ ] DNS SPF configuré et vérifié
- [ ] DNS DKIM configuré et vérifié
- [ ] DNS DMARC configuré avec p=quarantine minimum
- [ ] Domaine "Verified" sur Resend Dashboard
- [ ] NEXTAUTH_URL configuré en production
- [ ] Test d'envoi réussi avec headers PASS
- [ ] Score Mail-Tester > 8/10

### Contenu Email

- [ ] Adresse d'envoi : contact@thermogain.fr (pas noreply)
- [ ] Sujets optimisés (40-50 caractères)
- [ ] Preview text informatif et engageant
- [ ] Lien de désabonnement ajouté au footer
- [ ] URLs pointent vers domaine principal
- [ ] Aucun mot spam flagrant
- [ ] Ratio texte/image respecté

### Domain Warming

- [ ] Plan de warming établi sur 6 semaines
- [ ] Semaine 1-2 : 50-100 emails/jour
- [ ] Semaine 3-4 : 200-500 emails/jour
- [ ] Semaine 5-6 : 1000-2000 emails/jour
- [ ] Surveillance quotidienne des métriques
- [ ] Taux de bounce < 2%
- [ ] Taux de complaints < 0.1%

### Monitoring

- [ ] Dashboard Resend consulté quotidiennement
- [ ] Google Postmaster Tools configuré
- [ ] Alertes configurées (bounce, complaints)
- [ ] Blacklists vérifiées hebdomadairement
- [ ] Nettoyage liste emails inactifs mensuel

---

## 🎓 Conclusion

**Problème principal identifié :** Domaine neuf sans réputation + possiblement authentification DNS manquante

**Priorité absolue :**
1. ⚡ Vérifier/configurer SPF, DKIM, DMARC (JOUR 1)
2. ⚡ Configurer NEXTAUTH_URL en production (JOUR 1)
3. 🔥 Commencer domain warming progressif (SEMAINES 1-6)
4. 📧 Améliorer contenu emails (JOURS 2-3)
5. 📈 Monitorer en continu (PERMANENT)

**Temps estimé pour sortir du spam :**
- Si DNS bien configuré : 2-4 jours
- Avec domain warming : 2-6 semaines pour réputation solide
- Amélioration continue sur 3 mois

**⚠️ Réalité importante :** Un domaine neuf prend du temps à établir sa réputation. Même avec une configuration parfaite, attendez-vous à des problèmes les premières semaines. La patience et la progression graduelle sont essentielles.

**Support disponible :**
- Resend Support : support@resend.com
- Dashboard Resend : https://resend.com/overview
- Documentation : https://resend.com/docs

---

**Analyse réalisée le 1er décembre 2025**
