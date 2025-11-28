# Validation conditionnelle avec Zod : Le cas des champs dépendants

## Contexte

Dans l'application ThermoGain, l'étape "projet-pac" contient des champs qui sont **conditionnellement requis** selon le type de PAC sélectionné :

- Si l'utilisateur choisit une PAC hydraulique (**Air/Eau** ou **Eau/Eau**), les champs suivants deviennent obligatoires :
  - `temperature_depart` (Température de départ en °C)
  - `emetteurs` (Type d'émetteurs)

- Si l'utilisateur choisit une PAC **Air/Air**, ces champs ne sont pas requis.

## Problème rencontré

### Symptôme
Les champs `temperature_depart` et `emetteurs` affichaient l'astérisque rouge `*` indiquant qu'ils étaient requis, mais **aucun message d'erreur n'apparaissait** lorsque l'utilisateur soumettait le formulaire sans les remplir.

### Cause racine

#### 1. Architecture de validation Zod

Le schéma Zod était structuré ainsi :

```typescript
export const heatPumpProjectSchema = z.object({
  // Champs obligatoires
  type_pac: z.enum([...]).required(),
  puissance_pac_kw: z.number().required(),
  cop_estime: z.number().required(),
  // ... autres champs obligatoires

  // Champs conditionnels - optionnels dans le schéma de base
  temperature_depart: z.number().min(30).max(80).optional(),
  emetteurs: z.enum([...]).optional(),
}).superRefine((data, ctx) => {
  // Validation conditionnelle
  const isWaterBased = data.type_pac === "Air/Eau" || data.type_pac === "Eau/Eau"

  if (isWaterBased) {
    if (data.temperature_depart === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La température de départ est requise pour les PAC hydrauliques",
        path: ["temperature_depart"],
      })
    }
    if (data.emetteurs === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le type d'émetteurs est requis pour les PAC hydrauliques",
        path: ["emetteurs"],
      })
    }
  }
})
```

#### 2. Le comportement de Zod `safeParse`

**Point crucial** : Quand Zod valide un schéma avec `safeParse()`, il procède en deux phases :

1. **Phase 1 : Validation des champs de base**
   - Zod valide tous les champs définis dans `z.object({})`
   - Si un champ a une validation `.number()`, `.string()`, etc., et que la valeur est `undefined`, Zod génère une erreur `invalid_type`

2. **Phase 2 : Exécution du `superRefine`**
   - **MAIS** : Si la Phase 1 a généré des erreurs, Zod **n'exécute PAS** le `superRefine` !
   - Le `superRefine` n'est exécuté que si **tous les champs de base sont valides**

#### 3. Le scénario problématique

Voici ce qui se passait quand l'utilisateur soumettait le formulaire avec des champs vides :

```
Utilisateur clique sur "Suivant"
  ↓
Zod lance safeParse(formData)
  ↓
Phase 1 : Validation des champs de base
  ├─ type_pac: undefined → ❌ Erreur "invalid_type"
  ├─ puissance_pac_kw: undefined → ❌ Erreur "invalid_type"
  ├─ cop_estime: undefined → ❌ Erreur "invalid_type"
  ├─ duree_vie_pac: undefined → ❌ Erreur "invalid_type"
  ├─ entretien_pac_annuel: undefined → ❌ Erreur "invalid_type"
  └─ temperature_depart: undefined → ✅ OK (champ .optional())
  └─ emetteurs: undefined → ✅ OK (champ .optional())
  ↓
❌ La Phase 1 a des erreurs
  ↓
⚠️ ARRÊT : Zod ne lance PAS la Phase 2 (superRefine)
  ↓
Résultat :
  ✅ Les erreurs des champs obligatoires sont affichées
  ❌ Les erreurs de temperature_depart et emetteurs ne sont JAMAIS générées
```

### Logs de débogage

Voici ce que les logs révélaient :

```javascript
🔍 Validation failed, all issues:
[
  { code: 'invalid_type', path: ['puissance_pac_kw'], message: 'La puissance de la PAC est requise' },
  { code: 'invalid_type', path: ['cop_estime'], message: 'Le COP estimé est requis' },
  { code: 'invalid_type', path: ['duree_vie_pac'], message: 'La durée de vie de la PAC est requise' },
  { code: 'invalid_type', path: ['entretien_pac_annuel'], message: "Le coût d'entretien annuel est requis" },
  // ❌ Aucune erreur pour temperature_depart et emetteurs !
]

// ⚠️ Absence totale du log "🔧 superRefine executed:"
// Ce qui confirme que le superRefine n'a jamais été appelé
```

## Solution implémentée

### Approche : Validation manuelle en complément de Zod

Puisque le `superRefine` n'est pas fiable pour les validations conditionnelles quand d'autres champs peuvent être invalides, nous avons ajouté une **validation manuelle** directement dans le composant `page.tsx`.

### Code de la solution

Dans `/app/(main)/projects/[projectId]/[step]/page.tsx` :

```typescript
const onSubmit = async (data: any) => {
  setIsSubmitting(true)
  try {
    let validatedData = data

    const refactoredSteps = ["informations", "logement", "chauffage-actuel", "projet-pac", "couts", "aides", "financement"]
    if (refactoredSteps.includes(step)) {
      const schema = SCHEMAS[step as keyof typeof SCHEMAS]
      const result = schema.safeParse(formData)

      const errorMap: Record<string, string> = {}

      // 1️⃣ Collecter les erreurs de validation Zod
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const fieldName = issue.path[0].toString()
            if (!errorMap[fieldName]) {
              errorMap[fieldName] = issue.message
            }
          }
        })
      }

      // 2️⃣ Pour l'étape projet-pac : ajouter la validation manuelle des champs conditionnels
      if (step === "projet-pac") {
        const typePac = formData.type_pac
        const isWaterBased = typePac === "Air/Eau" || typePac === "Eau/Eau"

        if (isWaterBased) {
          // Valider temperature_depart
          if (formData.temperature_depart === undefined) {
            errorMap.temperature_depart = "La température de départ est requise pour les PAC hydrauliques"
          }

          // Valider emetteurs
          if (formData.emetteurs === undefined) {
            errorMap.emetteurs = "Le type d'émetteurs est requis pour les PAC hydrauliques"
          }
        }
      }

      // 3️⃣ S'il y a des erreurs (Zod ou manuelles), les afficher
      if (Object.keys(errorMap).length > 0) {
        setErrors(errorMap)
        setIsSubmitting(false)
        return
      }

      validatedData = result.data
    }

    // Suite du traitement...
  } catch (error) {
    console.error("Error submitting form:", error)
  } finally {
    setIsSubmitting(false)
  }
}
```

### Pourquoi cette solution fonctionne

1. **Collection des erreurs Zod** : On récupère toutes les erreurs générées par la Phase 1 de Zod (champs obligatoires manquants)

2. **Validation manuelle supplémentaire** : On ajoute manuellement les erreurs pour les champs conditionnels **dans le même `errorMap`**

3. **Affichage unifié** : Les erreurs Zod et manuelles sont combinées dans un seul objet `errorMap`, puis passées à `setErrors(errorMap)`

4. **Résultat** : L'utilisateur voit **toutes les erreurs en même temps** :
   - Les champs obligatoires manquants (de Zod)
   - Les champs conditionnels manquants (validation manuelle)

### Avantages de cette approche

✅ **Fiabilité** : Les erreurs sont toujours affichées, même si Zod n'exécute pas le `superRefine`

✅ **Simplicité** : Pas besoin de modifier profondément l'architecture de validation

✅ **Maintenabilité** : Le code de validation manuelle est isolé et documenté

✅ **Performance** : Aucun impact sur les performances (validation synchrone)

✅ **Extensibilité** : Facile d'ajouter d'autres validations conditionnelles pour d'autres étapes

## Alternatives envisagées (et pourquoi elles n'ont pas été retenues)

### Alternative 1 : Rendre tous les champs optionnels et tout valider dans `superRefine`

**Idée** : Déplacer toute la validation (y compris les champs obligatoires) dans le `superRefine`.

```typescript
export const heatPumpProjectSchema = z.object({
  type_pac: z.enum([...]).optional(),
  puissance_pac_kw: z.number().optional(),
  cop_estime: z.number().optional(),
  // ... tous les champs en .optional()
}).superRefine((data, ctx) => {
  // Valider TOUS les champs ici
  if (!data.type_pac) {
    ctx.addIssue({ path: ["type_pac"], message: "..." })
  }
  if (!data.puissance_pac_kw) {
    ctx.addIssue({ path: ["puissance_pac_kw"], message: "..." })
  }
  // etc.
})
```

**Inconvénient** :
- ❌ Code très verbeux et répétitif
- ❌ Perte des validations natives de Zod (`.min()`, `.max()`, etc.)
- ❌ Difficile à maintenir

### Alternative 2 : Utiliser `.refine()` au lieu de `.superRefine()`

**Idée** : Valider les champs conditionnels avec `.refine()` après chaque champ.

```typescript
temperature_depart: z.number()
  .min(30)
  .max(80)
  .optional()
  .refine((val) => {
    // Problème : on n'a pas accès à type_pac ici !
  }, "Message d'erreur")
```

**Inconvénient** :
- ❌ `.refine()` n'a pas accès aux autres champs du schéma
- ❌ Impossible de valider un champ en fonction d'un autre

### Alternative 3 : Diviser le schéma en plusieurs schémas conditionnels

**Idée** : Créer un schéma différent pour chaque type de PAC.

```typescript
const airEauSchema = z.object({
  temperature_depart: z.number().required(),
  emetteurs: z.enum([...]).required(),
  // ...
})

const airAirSchema = z.object({
  temperature_depart: z.number().optional(),
  emetteurs: z.enum([...]).optional(),
  // ...
})
```

**Inconvénient** :
- ❌ Duplication massive du code
- ❌ Difficile à maintenir (3 schémas au lieu d'un)
- ❌ Complexité accrue dans le code de validation

## Leçons apprises

### 1. Comprendre le cycle de vie de `safeParse()`

Zod exécute la validation en plusieurs phases. Le `superRefine` n'est **pas garanti** d'être exécuté si les validations de base échouent.

### 2. Validation conditionnelle = Cas complexe

Les validations conditionnelles nécessitent une approche hybride :
- Utiliser Zod pour les validations simples et standards
- Ajouter une validation manuelle pour les cas conditionnels complexes

### 3. Toujours tester avec des données invalides

Tester uniquement le "happy path" (données valides) ne révèle pas ce genre de bugs. Il faut tester :
- ✅ Formulaire complètement vide
- ✅ Formulaire partiellement rempli
- ✅ Champs conditionnels manquants
- ✅ Combinaisons de types différents (Air/Eau, Air/Air, etc.)

### 4. Logs de débogage essentiels

Les logs de débogage ont été cruciaux pour identifier le problème :

```typescript
console.log("🔧 superRefine executed:", data)  // Jamais affiché = superRefine pas exécuté
console.log("🔍 Validation failed:", issues)   // Affiche les erreurs Zod
console.log("🗺️ Final error map:", errorMap)  // Vérifie quelles erreurs sont transmises au composant
```

## Guide pour ajouter de nouvelles validations conditionnelles

Si vous devez ajouter une validation conditionnelle similaire à une autre étape :

### Étape 1 : Définir les champs comme `.optional()` dans le schéma Zod

```typescript
export const mySchema = z.object({
  type_selection: z.enum(["A", "B"]),
  champ_conditionnel: z.string().optional(),  // ← .optional()
})
```

### Étape 2 : Ajouter la validation manuelle dans `page.tsx`

Dans la fonction `onSubmit`, après la validation Zod :

```typescript
// Pour l'étape mon-etape : validation conditionnelle
if (step === "mon-etape") {
  const typeSelection = formData.type_selection

  if (typeSelection === "A") {
    if (formData.champ_conditionnel === undefined) {
      errorMap.champ_conditionnel = "Ce champ est requis pour le type A"
    }
  }
}
```

### Étape 3 : Documenter la logique conditionnelle

Ajouter un commentaire dans le schéma Zod :

```typescript
champ_conditionnel: z.string().optional(),  // Requis uniquement si type_selection === "A"
```

### Étape 4 : Tester tous les cas

- [ ] Type A avec champ vide → Doit afficher l'erreur
- [ ] Type A avec champ rempli → Doit passer
- [ ] Type B avec champ vide → Doit passer (champ non requis)
- [ ] Type B avec champ rempli → Doit passer

## Conclusion

La validation conditionnelle avec Zod nécessite parfois une approche hybride combinant :
1. Les validations natives de Zod pour les champs standards
2. Une validation manuelle pour les règles métier complexes et conditionnelles

Cette solution garantit que **tous les champs requis affichent une erreur**, peu importe l'état du reste du formulaire, offrant ainsi une expérience utilisateur cohérente et prévisible.
