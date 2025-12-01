# Bonnes Pratiques Email - ThermoGain

Ce document détaille les bonnes pratiques appliquées pour les emails transactionnels de ThermoGain, basées sur les standards 2025 en matière d'UX, design et délivrabilité.

## 📋 Table des matières

- [Structure et Layout](#structure-et-layout)
- [Design et UX](#design-et-ux)
- [Délivrabilité](#délivrabilité)
- [Accessibilité](#accessibilité)
- [Ligne de sujet](#ligne-de-sujet)

---

## 🏗 Structure et Layout

### Architecture des templates

**Layout réutilisable** (`email-layout.tsx`)
- Layout commun pour tous les emails
- Header avec logo et nom de marque
- Zone de contenu modulaire
- Footer avec liens légaux et copyright

**Largeur optimale**
- **600px** : Largeur maximale du container
- Standard optimal pour compatibilité multi-clients
- Garantit un affichage correct dans les preview panes

### Structure HTML

**Table-based layout**
- Utilisation de `<table>` au lieu de `<div>`
- Meilleure compatibilité avec clients email (notamment Outlook)
- Styles inline pour éviter la suppression des `<style>` tags

**Mobile-first**
- Design responsive
- Boutons de minimum **44px de hauteur** (zone tappable)
- Police de **16px minimum** pour le corps du texte
- Layout en colonne unique pour mobile

---

## 🎨 Design et UX

### Hiérarchie visuelle

**Typographie**
- Titre (H1) : 28px, bold, centré
- Corps de texte : 16px, line-height 26px
- Texte secondaire : 14px, line-height 22px

**Couleurs**
- CTA principal : `#ea580c` (Orange ThermoGain)
- Texte principal : `#374151` (Gris foncé)
- Texte secondaire : `#6b7280` (Gris moyen)
- Background : `#f6f9fc` (Gris très clair)

### Call-to-Action (CTA)

**Bouton principal**
- Couleur contrastée (#ea580c)
- Padding généreux (14px 40px)
- Border-radius 8px
- Font-weight 600
- Min-height 44px pour mobile

**Texte du CTA**
- Action claire et directe
- Verbe à l'impératif
- Court et précis (ex: "Confirmer mon adresse email")

### Ratio contenu

**60% texte / 40% visuel**
- Améliore la délivrabilité
- Évite les filtres anti-spam
- Meilleure expérience si images désactivées

---

## 📬 Délivrabilité

### Authentification

**Configuration requise**
- SPF : Authentification du serveur d'envoi
- DKIM : Signature cryptographique
- DMARC : Politique de gestion des emails

**Domaine d'envoi**
- Utiliser un domaine vérifié dans Resend
- `noreply@thermogain.fr` (ou domaine personnalisé)

### Contenu

**Éviter les mots spam**
- ❌ "gratuit", "urgent", "gagnez de l'argent"
- ❌ Trop de majuscules ou points d'exclamation
- ❌ Pièces jointes non sollicitées

**Bonnes pratiques**
- ✅ Ratio texte/image équilibré
- ✅ Liens HTTPS uniquement
- ✅ Alt text sur toutes les images
- ✅ Lien de désabonnement (pour emails marketing)

### Hygiène de liste

**Validation en temps réel**
- Vérification de l'email à l'inscription
- Double opt-in (email de vérification)
- Suppression des bounces

**Nettoyage régulier**
- Retirer les emails invalides
- Supprimer les utilisateurs inactifs
- Maintenir un taux de bounce < 2%

---

## ♿️ Accessibilité

### Images

**Alt text obligatoire**
```tsx
<Img
  src="https://thermogain.fr/logo.png"
  alt="ThermoGain Logo"
  width="48"
  height="48"
/>
```

**Fallback texte**
- Ne jamais compter uniquement sur les images
- Inclure le message important en texte
- Les images peuvent être bloquées par défaut

### Contraste

**WCAG 2.1 AA minimum**
- Ratio 4.5:1 pour texte normal
- Ratio 3:1 pour texte large (18px+)
- Utiliser des outils de vérification

### Structure sémantique

**Headings appropriés**
- Un seul `<h1>` par email
- Hiérarchie logique (h1 → h2 → h3)

**Lien descriptif**
- Texte de lien explicite
- Éviter "cliquez ici"
- Contexte clair même hors contexte

---

## 📧 Ligne de sujet

### Règles d'or

**Longueur optimale**
- **6-10 mots** idéal
- **< 50 caractères** (< 42 pour mobile)
- Message complet même si tronqué

**Structure efficace**
- Action en début de ligne
- Valeur claire et immédiate
- Pas de clickbait

**Exemples ThermoGain**
- ✅ "Confirmez votre email ThermoGain" (35 car)
- ✅ "Votre étude PAC est prête" (28 car)
- ❌ "Action requise concernant votre compte" (43 car, vague)
- ❌ "🎉 Vous n'allez pas croire ce qui vous attend !" (spam)

### Personnalisation

**Quand l'utiliser**
- Prénom dans sujet : +15-20% d'ouverture
- Mais attention à la sur-utilisation
- Tester l'impact réel sur votre audience

**Exemple**
```
"Pierre, confirmez votre email" vs "Confirmez votre email"
```

### Éviter les spam triggers

**Mots à éviter**
- "Gratuit", "Urgent", "Dernière chance"
- "€€€", "$$$", multiples "!!!"
- "100% garanti", "Pas de spam"

**Bonnes pratiques**
- Ton professionnel
- Pas de majuscules excessives
- Ponctuation normale

---

## 📊 Métriques à suivre

### Taux d'ouverture
- **Moyenne 2025** : 37.93%
- **Bon taux** : > 40%
- ⚠️ Note : iOS 15+ fausse les statistiques (auto-load)

### Taux de clic (CTR)
- **Moyenne** : 2-5%
- **Bon taux** : > 3%
- Mesure l'engagement réel

### Taux de bounce
- **Hard bounce** : < 2% (emails invalides)
- **Soft bounce** : < 5% (boîtes pleines, etc.)

### Taux de spam
- **Cible** : < 0.1%
- Au-dessus de 0.3% : problème sérieux

---

## 🔧 Tests et validation

### Tests clients email

**Clients prioritaires**
- Gmail (Desktop + Mobile)
- Apple Mail (iOS + macOS)
- Outlook (Windows + Web)
- Yahoo Mail
- ProtonMail (sécurité)

### Outils recommandés

**Preview multi-clients**
- Litmus
- Email on Acid
- Mailtrap (dev/staging)

**Validation HTML**
- W3C Validator
- Email Markup Validator

### Checklist pré-envoi

- [ ] Sujet < 50 caractères
- [ ] Preview text optimisé
- [ ] CTA visible et cliquable (44px min)
- [ ] Alt text sur toutes les images
- [ ] Liens testés (pas de 404)
- [ ] Responsive mobile
- [ ] Test anti-spam (Mail Tester)
- [ ] Lien de désabonnement (si marketing)

---

## 📚 Ressources

### Documentation
- [React Email](https://react.email/)
- [Resend Documentation](https://resend.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Outils de test
- [Mail Tester](https://www.mail-tester.com/)
- [Can I Email](https://www.caniemail.com/)
- [Email Markup Validator](https://www.htmlemailcheck.com/check/)

### Statistiques 2025
- [Email Marketing Benchmarks](https://www.omnisend.com/blog/email-marketing-statistics/)
- [Deliverability Best Practices](https://www.validity.com/blog/email-deliverability-best-practices/)

---

**Dernière mise à jour** : Décembre 2025
**Version** : 1.0
