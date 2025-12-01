# Bonnes Pratiques UX/Design - Page Profil B2B 2025

## Contexte
Page de profil pour ThermoGain (application B2B pour professionnels du génie climatique)
Utilisateurs : Installateurs, bureaux d'études, artisans

---

## Principes Clés UX pour B2B

### 1. **Clarté et Professionnalisme avant tout**
- **UI sobre et fonctionnelle** > Design flashy
- **Hiérarchie visuelle claire** : Les informations les plus importantes en haut
- **Crédibilité et confiance** : Design professionnel, pas d'éléments superflus

### 2. **Accessibilité en moins d'une minute**
- Si l'utilisateur ne trouve pas ce qu'il cherche en < 60 secondes, il abandonne
- Navigation intuitive et prévisible
- Zones de clic généreuses (44x44px minimum pour mobile)

### 3. **Adaptation Mobile-First**
- Formulaires en une colonne sur mobile
- Champs pré-remplis quand possible
- Labels clairs et persistants
- Design responsive sur tous écrans

---

## Mode d'Édition : Choix Stratégiques

### ❌ NE PAS FAIRE : Inline Editing Généralisé
**Problèmes :**
- Accidentellement modifier des données en cliquant
- Encombrement visuel (trop de boutons d'édition partout)
- Confusion entre mode lecture/édition
- Pas adapté aux formulaires complexes

### ✅ RECOMMANDÉ : Édition par Section (Section-Level Editing)

**Inspiré de LinkedIn, Facebook, GitHub**

**Avantages :**
- **Contexte préservé** : On voit le reste des infos pendant l'édition
- **Édition ciblée** : On modifie uniquement la section concernée
- **Moins d'erreurs** : Mode lecture/édition clairement séparé
- **Validation par section** : Feedback immédiat
- **UX familière** : Pattern reconnu par les utilisateurs B2B

**Implémentation :**
1. Vue par défaut : **Mode Lecture** (read-only)
   - Données affichées dans des cards/sections
   - Bouton "Modifier" par section
   - Possibilité d'imprimer/partager

2. Clic sur "Modifier" : **Mode Édition** de la section
   - Transformation des textes en inputs
   - Focus automatique sur le premier champ
   - Boutons "Enregistrer" / "Annuler"
   - Indication visuelle claire du mode édition

3. Enregistrement : Retour au mode lecture
   - Message de confirmation
   - Mise à jour immédiate
   - Pas de rechargement de page complet

---

## Structure de la Page Profil B2B

### Sections Recommandées (Par ordre de priorité)

#### 1. **En-tête Identité**
- Avatar/Initiales (grande taille, professionnel)
- Nom complet
- Email (non modifiable, identifiant unique)
- Statut du compte (actif, vérifié)

#### 2. **Informations Personnelles** 📱
- Nom complet
- Téléphone professionnel
- Email (lecture seule)

**Bouton "Modifier"** → Mode édition de cette section uniquement

#### 3. **Informations Professionnelles** 🏢
**Critiques pour B2B !**
- Nom de l'entreprise
- SIRET (obligatoire en France pour facturation)
- Adresse professionnelle
  - Rue + numéro (1 champ)
  - Code postal (1 champ)
  - Ville (1 champ)
- Site web de l'entreprise

**Bouton "Modifier"** → Mode édition de cette section uniquement

**Note importante** : Ces infos apparaissent dans les emails aux clients !

#### 4. **Bannière Informative** 💡
```
ℹ️ Vos informations professionnelles apparaissent dans les emails
   de résultats envoyés à vos clients. Assurez-vous qu'elles sont
   à jour pour une présentation professionnelle.
```

---

## Spécifications Techniques

### Gestion des États

**3 états par section :**

1. **Mode Lecture** (défaut)
   ```tsx
   <div className="section-card">
     <h3>Informations professionnelles</h3>
     <div className="data-display">
       <p><strong>Entreprise:</strong> SARL Martin Chauffage</p>
       <p><strong>SIRET:</strong> 123 456 789 00012</p>
       ...
     </div>
     <Button onClick={() => setEditMode(true)}>Modifier</Button>
   </div>
   ```

2. **Mode Édition**
   ```tsx
   <form className="section-edit-mode">
     <h3>Modifier les informations professionnelles</h3>
     <Input label="Entreprise" value={company} />
     <Input label="SIRET" value={siret} />
     ...
     <div className="actions">
       <Button variant="primary" onClick={handleSave}>Enregistrer</Button>
       <Button variant="ghost" onClick={handleCancel}>Annuler</Button>
     </div>
   </form>
   ```

3. **Chargement/Sauvegarde**
   ```tsx
   {isSaving && <LoadingSpinner />}
   {saveSuccess && <SuccessMessage />}
   {saveError && <ErrorMessage />}
   ```

### Validation

**Côté client (immédiate) :**
- Format email valide
- SIRET : 14 chiffres
- Code postal : 5 chiffres
- Téléphone : format français
- URL site web : format valide

**Côté serveur (avant sauvegarde) :**
- Vérification SIRET via API Sirene (optionnel mais recommandé)
- Sanitization des inputs
- Vérification unicité email

### Feedback Utilisateur

**Messages de succès** (Toast vert, 3 secondes)
```
✓ Informations professionnelles mises à jour avec succès
```

**Messages d'erreur** (Toast rouge, persistent jusqu'à fermeture)
```
✗ Erreur : Le SIRET doit contenir 14 chiffres
✗ Erreur de sauvegarde. Veuillez réessayer.
```

**Champs en erreur** (border rouge + texte explicatif)
```tsx
<Input
  error="Le SIRET doit contenir exactement 14 chiffres"
  className="border-red-500"
/>
```

---

## Champ SIRET : Spécifications

### Pourquoi c'est important en B2B
- **Obligation légale** : Requis sur toutes factures/devis en France
- **Crédibilité** : Prouve que l'entreprise existe légalement
- **Confiance client** : Rassure les clients finaux

### Format et Validation

**Format attendu :** 14 chiffres (pas d'espaces)
- Exemple : `12345678900012`
- Affichage formaté : `123 456 789 00012` (groupes de 3-3-3-5)

**Validation :**
```typescript
const validateSIRET = (siret: string): boolean => {
  // Retirer les espaces
  const cleaned = siret.replace(/\s/g, '')

  // Vérifier 14 chiffres
  if (!/^\d{14}$/.test(cleaned)) return false

  // Algorithme de Luhn (optionnel mais recommandé)
  // Vérifie que le SIRET est mathématiquement valide
  return luhnCheck(cleaned)
}
```

**UX du champ SIRET :**
- Label : "SIRET (14 chiffres)"
- Placeholder : "123 456 789 00012"
- Auto-formatage pendant la saisie (ajoute des espaces)
- Validation en temps réel
- Lien d'aide : "Comment trouver mon SIRET ?"

---

## Intégration dans l'Email de Résultats

### Modifications Template Email

**Section "Contact Professionnel" (nouveau)** :

```html
<Section style={contactSection}>
  <Heading style={h3}>Votre Contact</Heading>
  <Text style={contactInfo}>
    <strong>{{professionalName}}</strong><br />
    {{company}}<br />
    SIRET : {{siret}}<br />
    {{address}}<br />
    {{postalCode}} {{city}}<br />
    Tél : {{phone}}<br />
    {{website}}
  </Text>
</Section>
```

**Placement dans l'email :**
1. Header (Logo + Nom)
2. Corps du message (Résultats PAC)
3. **→ Contact Professionnel** (nouveau)
4. CTA "Voir les résultats détaillés"
5. Footer (Mentions légales)

---

## Modifications Base de Données

### Prisma Schema - Modèle User

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  firstName     String?
  lastName      String?
  email         String    @unique
  emailVerified DateTime?

  // Professional information
  company       String?
  siret         String?   // NOUVEAU - 14 chiffres
  phone         String?
  address       String?
  city          String?
  postalCode    String?
  website       String?

  // ... autres champs
}
```

**Migration Prisma :**
```bash
npx prisma migrate dev --name add_siret_to_user
```

---

## Checklist d'Implémentation

### Phase 1 : Structure
- [ ] Créer le layout par sections (Identité, Perso, Pro)
- [ ] Implémenter le mode lecture (affichage des données)
- [ ] Ajouter boutons "Modifier" par section

### Phase 2 : Édition
- [ ] Implémenter basculement Lecture ↔ Édition par section
- [ ] Créer les formulaires d'édition
- [ ] Ajouter validation côté client
- [ ] Gérer les états (loading, success, error)

### Phase 3 : Backend
- [ ] Ajouter champ `siret` au modèle User (Prisma)
- [ ] Créer migration database
- [ ] Implémenter server action `updateProfile`
- [ ] Ajouter validation serveur + sanitization

### Phase 4 : Email
- [ ] Modifier template `study-results-email.tsx`
- [ ] Ajouter section Contact Professionnel
- [ ] Inclure SIRET dans les données envoyées
- [ ] Tester rendu email avec toutes les infos

### Phase 5 : UX Polish
- [ ] Ajouter messages toast (succès/erreur)
- [ ] Implémenter auto-save des brouillons (optionnel)
- [ ] Ajouter indicateurs de validation en temps réel
- [ ] Tests responsive (mobile/tablet/desktop)

---

## Exemples de Code

### 1. Composant Section Éditable

```tsx
function EditableSection({
  title,
  icon,
  children,
  onSave
}: EditableSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (data) => {
    setIsSaving(true)
    const result = await onSave(data)
    setIsSaving(false)

    if (result.success) {
      setIsEditing(false)
      toast.success("Modifications enregistrées")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3>{title}</h3>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Modifier
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <EditForm
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
            isSaving={isSaving}
          >
            {children}
          </EditForm>
        ) : (
          <DisplayData>{children}</DisplayData>
        )}
      </CardContent>
    </Card>
  )
}
```

### 2. Input SIRET avec Validation

```tsx
function SIRETInput({ value, onChange, error }) {
  const formatSIRET = (val: string) => {
    const cleaned = val.replace(/\s/g, '')
    const match = cleaned.match(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,5})/)
    if (match) {
      return [match[1], match[2], match[3], match[4]]
        .filter(Boolean)
        .join(' ')
    }
    return val
  }

  const handleChange = (e) => {
    const formatted = formatSIRET(e.target.value)
    onChange(formatted)
  }

  return (
    <div>
      <Label htmlFor="siret">
        SIRET (14 chiffres)
        <a href="/aide/siret" className="ml-2 text-xs">
          Comment le trouver ?
        </a>
      </Label>
      <Input
        id="siret"
        value={value}
        onChange={handleChange}
        placeholder="123 456 789 00012"
        maxLength={17} // 14 chiffres + 3 espaces
        error={error}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
```

---

## Ressources et Références

### Design Patterns
- LinkedIn Profile Settings (section-level editing)
- GitHub Settings (tab-based sections)
- Notion Workspace Settings (inline + modal hybrid)

### Librairies Utiles
- `react-hook-form` : Gestion de formulaires
- `zod` : Validation schema TypeScript
- `sonner` : Toast notifications élégantes
- `@react-email/components` : Templates email

### API Externes (Optionnel)
- **API Sirene (INSEE)** : Vérification SIRET
  - Endpoint : `https://api.insee.fr/entreprises/sirene/V3/siret/{siret}`
  - Permet de vérifier l'existence et récupérer infos entreprise
  - Gratuit avec inscription

---

## Conclusion

**Pattern recommandé pour ThermoGain :**
✅ **Édition par section avec mode lecture/édition distinct**

**Raisons :**
1. Contexte B2B : Professionnels veulent imprimer/partager leur profil
2. Données critiques (SIRET, contact) : Éviter modifications accidentelles
3. UX familière : Pattern utilisé par LinkedIn, GitHub
4. Validation complexe : Plus facile à gérer par section
5. Mobile-friendly : Moins de clutter, focus sur une section à la fois

**ROI attendu :**
- ↑ Taux de complétion des profils (infos professionnelles complètes)
- ↓ Erreurs de saisie (validation + mode distinct)
- ↑ Confiance client (SIRET visible = crédibilité)
- ↑ Professionnalisme emails (contact complet avec SIRET)
