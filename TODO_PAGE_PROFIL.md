# TODO : Implémentation Page Profil B2B

## ✅ Fait

1. **Recherche UX/Design**
   - ✅ Recherche bonnes pratiques profil B2B 2025
   - ✅ Analyse inline editing vs edit mode
   - ✅ Documentation complète créée (BONNES_PRATIQUES_PAGE_PROFIL_B2B.md)

2. **Base de Données**
   - ✅ Ajout champ `siret` au modèle User (Prisma)
   - ✅ Migration/push base de données

3. **Structure de Base**
   - ✅ Page `/profil` créée dans `app/(footer)/profil/page.tsx`
   - ✅ Layout footer appliqué (header + navigation)
   - ✅ Lien "Profil" activé dans UserMenu
   - ✅ Composant Skeleton ajouté

4. **Server Action**
   - ✅ Fichier `lib/actions/update-profile.ts` créé (base)

## 🚧 À Faire

### Phase 1 : Refonte Page Profil (Édition par Section)

#### 1.1 Structure Composants
- [ ] Créer composant `EditableSection` réutilisable
  - Props: title, icon, isEditing, onEdit, onSave, onCancel
  - Gestion état lecture/édition
  - Boutons Modifier/Enregistrer/Annuler

- [ ] Créer composant `SIRETInput` avec validation
  - Auto-formatage (123 456 789 00012)
  - Validation en temps réel (14 chiffres)
  - Lien aide "Comment trouver mon SIRET ?"

#### 1.2 Sections de la Page

**Section 1 : En-tête Identité** (non éditable)
- [ ] Avatar avec initiales (grande taille)
- [ ] Nom complet
- [ ] Email (lecture seule)
- [ ] Badge statut "Compte vérifié"

**Section 2 : Informations Personnelles** (éditable)
- [ ] Mode lecture : affichage Nom, Téléphone
- [ ] Mode édition : formulaire avec validation
- [ ] Bouton "Modifier" → basculement

**Section 3 : Informations Professionnelles** (éditable)
- [ ] Mode lecture : Entreprise, SIRET, Adresse, CP, Ville, Site web
- [ ] Mode édition : formulaire avec tous les champs
- [ ] Input SIRET avec validation spéciale
- [ ] Bouton "Modifier" → basculement

**Section 4 : Bannière Informative**
- [ ] Message expliquant que les infos pro apparaissent dans les emails
- [ ] Style bleu info (comme dans BONNES_PRATIQUES)

#### 1.3 Validation & UX
- [ ] Validation côté client (react-hook-form + zod)
- [ ] Messages d'erreur inline par champ
- [ ] Toast notifications (succès/erreur) avec sonner
- [ ] Loading states pendant sauvegarde
- [ ] Confirmation avant annulation si modifications en cours

### Phase 2 : Backend & API

#### 2.1 Server Action `updateProfile`
- [ ] Compléter validation serveur
- [ ] Ajouter le champ `siret` dans les updates
- [ ] Sanitization des inputs
- [ ] Gestion erreurs robuste

#### 2.2 Types TypeScript
- [ ] Étendre interface `ExtendedUser` avec `siret`
- [ ] Créer schema Zod pour validation
- [ ] Types pour les formulaires

### Phase 3 : Intégration Email

#### 3.1 Template Email `study-results-email.tsx`
- [ ] Ajouter section "Contact Professionnel"
- [ ] Inclure SIRET dans les données
- [ ] Formatter l'affichage (nom, entreprise, SIRET, adresse complète, tél, site)
- [ ] Placement après les résultats, avant le CTA

#### 3.2 Action `send-study-results.ts`
- [ ] Ajouter `siret` dans les données passées au template
- [ ] Vérifier que toutes les infos pro sont incluses

### Phase 4 : Tests & Polish

#### 4.1 Tests Fonctionnels
- [ ] Tester édition de chaque section
- [ ] Tester validation SIRET (14 chiffres)
- [ ] Tester sauvegarde/annulation
- [ ] Tester messages erreur/succès

#### 4.2 Tests Responsive
- [ ] Mobile (formulaires une colonne)
- [ ] Tablet
- [ ] Desktop

#### 4.3 Tests Email
- [ ] Envoyer email de résultats avec SIRET
- [ ] Vérifier affichage sur Gmail/Outlook
- [ ] Vérifier formatage des informations

### Phase 5 : Documentation

- [ ] Mettre à jour README avec nouvelle page profil
- [ ] Documenter format SIRET
- [ ] Screenshots pour la doc
- [ ] Guide utilisateur "Comment compléter mon profil"

## 📦 Dépendances à Ajouter

```bash
npm install react-hook-form zod @hookform/resolvers sonner
```

## 📝 Fichiers à Créer/Modifier

### Créer
- `components/profile/EditableSection.tsx`
- `components/profile/SIRETInput.tsx`
- `lib/validations/profile-schema.ts` (Zod schemas)
- `lib/utils/siret-formatter.ts`

### Modifier
- ✅ `app/(footer)/profil/page.tsx` - Refonte complète
- ✅ `lib/actions/update-profile.ts` - Ajouter SIRET
- `email/templates/study-results-email.tsx` - Ajouter section contact
- `lib/actions/send-study-results.ts` - Inclure SIRET
- `components/UserMenu.tsx` - ✅ Déjà fait

### Déjà Fait
- ✅ `prisma/schema.prisma` - Champ siret ajouté
- ✅ `components/ui/skeleton.tsx` - Ajouté via shadcn
- ✅ `BONNES_PRATIQUES_PAGE_PROFIL_B2B.md` - Documentation

## 🎯 Critères de Succès

**Page Profil :**
- [x] Édition par section (pas inline généralisé)
- [ ] Mode lecture/édition clairement distinct
- [ ] Validation en temps réel
- [ ] Toast notifications sur actions
- [ ] Responsive (mobile-first)
- [ ] Champ SIRET validé et formaté

**Email de Résultats :**
- [ ] Section "Contact Professionnel" visible
- [ ] SIRET affiché et formaté (123 456 789 00012)
- [ ] Toutes les infos pro présentes
- [ ] Design cohérent avec reste de l'email

**Expérience Utilisateur :**
- [ ] Modification en < 2 minutes par section
- [ ] Messages erreur clairs et actionnables
- [ ] Aucune perte de données en cas d'annulation
- [ ] Feedback immédiat sur toutes les actions

## 🔗 Liens Utiles

- [BONNES_PRATIQUES_PAGE_PROFIL_B2B.md](./BONNES_PRATIQUES_PAGE_PROFIL_B2B.md)
- [API Sirene INSEE](https://api.insee.fr/catalogue/) - Validation SIRET (optionnel)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications

## 💡 Notes

- **SIRET** : 9 chiffres SIREN + 5 chiffres NIC = 14 chiffres au total
- **Validation Luhn** : Algorithme mathématique pour vérifier validité SIRET (optionnel mais recommandé)
- **Pattern choisi** : Section-level editing (inspiré LinkedIn/GitHub)
- **Mobile-first** : Formulaires en une colonne sur mobile
- **B2B** : Priorité à la clarté et au professionnalisme
