# Pattern de validation des champs obligatoires

## Problème rencontré

Lors de la validation d'un formulaire avec React Hook Form + Zod, certains champs obligatoires n'affichaient pas d'erreur lorsqu'ils étaient vides.

### Exemple du problème

```typescript
// ❌ PROBLÈME : Avec .default()
export const schema = z.object({
  age: z.number().min(18).default(25),
})

// Dans le composant
<Input
  type="number"
  {...field}
  onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
/>
```

**Résultat**:
- L'utilisateur laisse le champ vide
- L'input envoie `0` à Zod
- Zod applique `.default(25)` et la validation passe ✅ (pas d'erreur affichée !)

## Solution

### 1. Supprimer `.default()` des champs obligatoires

```typescript
// ✅ SOLUTION
export const schema = z.object({
  age: z
    .number({ message: "L'âge est requis" })
    .min(18, "Vous devez avoir au moins 18 ans"),
})
```

### 2. Convertir les valeurs vides en `undefined`

```typescript
// ✅ SOLUTION : Champs numériques
<Input
  type="number"
  value={field.value ?? ""}
  onChange={(e) => {
    const value = e.target.value
    field.onChange(value === "" ? undefined : Number(value))
  }}
  onBlur={field.onBlur}
  name={field.name}
  ref={field.ref}
/>

// ✅ SOLUTION : Champs texte
<Input
  value={field.value ?? ""}
  onChange={(e) => {
    const value = e.target.value
    field.onChange(value === "" ? undefined : value)
  }}
  onBlur={field.onBlur}
  name={field.name}
  ref={field.ref}
/>
```

### 3. Ajouter des messages personnalisés

```typescript
export const schema = z.object({
  // String
  code_postal: z
    .string({ message: "Le code postal est requis" })
    .min(1, "Le code postal est requis")
    .regex(/^[0-9]{5}$/, "Code postal invalide"),

  // Number
  age: z
    .number({ message: "L'âge est requis" })
    .min(18, "Vous devez avoir au moins 18 ans")
    .max(120, "L'âge ne peut pas dépasser 120 ans"),

  // Enum
  categorie: z.enum(["A", "B", "C"], {
    message: "La catégorie est requise",
  }),
})
```

## Pattern complet

### Schema Zod

```typescript
import { z } from "zod"

export const mySchema = z.object({
  // Champ texte obligatoire
  nom: z
    .string({ message: "Le nom est requis" })
    .min(1, "Le nom est requis"),

  // Champ numérique obligatoire
  age: z
    .number({ message: "L'âge est requis" })
    .min(1, "L'âge doit être supérieur à 0"),

  // Select obligatoire
  pays: z.enum(["France", "Belgique", "Suisse"], {
    message: "Le pays est requis",
  }),
})

export type MyFormData = z.infer<typeof mySchema>
```

### Composant React

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { mySchema, type MyFormData } from "./schema"

export function MyForm() {
  const form = useForm<MyFormData>({
    resolver: zodResolver(mySchema),
    defaultValues: {
      // Ne PAS mettre de valeurs par défaut pour les champs obligatoires
    },
  })

  return (
    <Form {...form}>
      {/* Champ texte */}
      <FormField
        control={form.control}
        name="nom"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom *</FormLabel>
            <FormControl>
              <Input
                placeholder="ex: Dupont"
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === "" ? undefined : value)
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Champ numérique */}
      <FormField
        control={form.control}
        name="age"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Âge *</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="ex: 25"
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === "" ? undefined : Number(value))
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Select (enum string) */}
      <FormField
        control={form.control}
        name="pays"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pays *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un pays" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="France">France</SelectItem>
                <SelectItem value="Belgique">Belgique</SelectItem>
                <SelectItem value="Suisse">Suisse</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Select (numeric - converti en string) */}
      <FormField
        control={form.control}
        name="puissance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Puissance (kVA) *</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number(value))}
              value={field.value?.toString() ?? ""}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la puissance" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="3">3 kVA</SelectItem>
                <SelectItem value="6">6 kVA</SelectItem>
                <SelectItem value="9">9 kVA</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  )
}
```

## Checklist de validation

Pour chaque champ obligatoire :

- [ ] ❌ Supprimer `.default()` du schéma Zod
- [ ] ✅ Ajouter `{ message: "..." }` dans la définition du type
- [ ] ✅ **Input** : Utiliser `value={field.value ?? ""}` et convertir `""` → `undefined` dans le `onChange`
- [ ] ✅ **Select string** : Utiliser `value={field.value}` directement
- [ ] ✅ **Select numérique** : Utiliser le spread conditionnel `{...(field.value !== undefined && { value: String(field.value) })}`
- [ ] ✅ Déstructurer manuellement les props du field au lieu d'utiliser `{...field}`

### Note importante sur les Selects numériques

Pour les Selects qui stockent des nombres mais affichent des strings (comme les puissances en kVA), il est crucial de **ne pas passer la prop `value` du tout** quand elle est `undefined` :

```typescript
// ✅ MEILLEURE APPROCHE : Utiliser le spread conditionnel
<Select
  onValueChange={(value) => field.onChange(Number(value))}
  {...(field.value !== undefined && { value: String(field.value) })}
>
```

**Approches qui NE FONCTIONNENT PAS** :

```typescript
// ❌ Ne fonctionne pas : value={undefined} n'est pas supporté par Radix UI
value={field.value !== undefined ? String(field.value) : undefined}

// ❌ Ne fonctionne pas : "" est considéré comme une valeur valide
value={field.value !== undefined ? String(field.value) : ""}
```

**Raison** : Radix UI Select n'affiche le placeholder que si la prop `value` n'est **pas définie** (omise complètement). Passer `value={undefined}` ou `value=""` ne fonctionne pas correctement sur toutes les versions. Le spread conditionnel `{...(condition && { value: ... })}` est la solution la plus fiable.

## Quand utiliser `.default()`

`.default()` doit être utilisé **uniquement** pour les champs **optionnels** où vous voulez une valeur par défaut :

```typescript
export const schema = z.object({
  // ✅ OK : Champ optionnel avec valeur par défaut technique
  duree_vie_pac: z.number().default(17), // Valeur basée sur études ADEME

  // ✅ OK : Champ optionnel avec valeur par défaut métier
  mode_financement: z.enum(["Comptant", "Crédit"]).default("Comptant"),

  // ❌ NON : Champ obligatoire
  nom: z.string().min(1).default(""), // Mauvaise pratique !
})
```

## Messages d'erreur personnalisés

### Messages génériques vs spécifiques

```typescript
// ❌ Message générique Zod (en anglais)
.number() // → "Expected number, received undefined"

// ✅ Message personnalisé (en français)
.number({ message: "Ce champ est requis" })

// ✅✅ Message encore plus spécifique
.number({ message: "L'année de construction est requise" })
```

## Cas particuliers

### Champs avec valeur 0 valide

Si `0` est une valeur valide pour votre champ :

```typescript
// Schema
quantity: z.number({ message: "La quantité est requise" }).min(0)

// Composant : Autoriser 0 mais pas undefined
<Input
  type="number"
  value={field.value === undefined ? "" : field.value}
  onChange={(e) => {
    const value = e.target.value
    if (value === "") {
      field.onChange(undefined)
    } else {
      const num = Number(value)
      field.onChange(isNaN(num) ? undefined : num)
    }
  }}
/>
```

### Champs numériques avec décimales

```typescript
// Schema
prix: z.number({ message: "Le prix est requis" }).min(0.01)

// Composant
<Input
  type="number"
  step="0.01"
  value={field.value ?? ""}
  onChange={(e) => {
    const value = e.target.value
    if (value === "") {
      field.onChange(undefined)
    } else {
      const num = parseFloat(value)
      field.onChange(isNaN(num) ? undefined : num)
    }
  }}
/>
```

### Champs conditionnellement requis - Unions discriminées

**⚠️ IMPORTANT : `superRefine` NE FONCTIONNE PAS avec React Hook Form !**

#### Problème rencontré

Dans l'étape 4 "Projet PAC", le champ `temperature_depart` était affiché mais ne montrait **aucun message d'erreur** lorsqu'il était laissé vide, alors qu'il devait être obligatoire pour les PAC hydrauliques (Air/Eau et Eau/Eau).

**Symptômes** :
- Le champ est visible à l'écran avec une astérisque `*` (requis)
- L'utilisateur laisse le champ vide
- Aucun message d'erreur rouge ne s'affiche sous le champ
- La validation semble "passer" alors qu'elle ne devrait pas

**Contexte** :
- Le champ `temperature_depart` doit être **requis** pour les PAC Air/Eau et Eau/Eau (systèmes hydrauliques)
- Le champ doit être **optionnel** pour les PAC Air/Air (pas de circuit hydraulique)
- Le champ est masqué dans l'UI pour les PAC Air/Air via un `{isWaterBased && ...}`

#### ❌ Tentatives de solution qui n'ont PAS fonctionné

##### Tentative 1 : Supprimer `.default()` uniquement

```typescript
// ❌ N'a pas résolu le problème
temperature_depart: z
  .number({ message: "La température de départ est requise" })
  .min(30)
  .max(80)
  .optional(),  // Toujours .optional() donc pas d'erreur affichée
```

**Résultat** : Aucune erreur n'apparaît car le champ est marqué `.optional()`.

##### Tentative 2 : Rendre le champ non-optional

```typescript
// ❌ Problème : Le champ devient requis même pour Air/Air
temperature_depart: z
  .number({ message: "La température de départ est requise" })
  .min(30)
  .max(80),  // Plus de .optional()
```

**Résultat** : La validation échoue pour les PAC Air/Air (même si le champ n'est pas affiché).

##### Tentative 3 : Utiliser `.or(z.undefined())`

```typescript
// ❌ Problème : Accepte undefined, donc pas de validation
temperature_depart: z
  .number({ message: "La température de départ est requise" })
  .min(30)
  .max(80)
  .or(z.undefined()),
```

**Résultat** : Zod accepte `undefined` comme valeur valide, donc aucune erreur.

##### Tentative 4 : Utiliser `.superRefine()` pour validation conditionnelle

```typescript
// ❌ NE FONCTIONNE PAS : Les erreurs ne s'affichent pas !
export const schema = z.object({
  type_pac: z.enum(["Air/Eau", "Eau/Eau", "Air/Air"]),
  temperature_depart: z.number().optional(),
  emetteurs: z.enum([...]).optional(),
}).superRefine((data, ctx) => {
  // ⚠️ Cette validation ne fonctionne pas avec React Hook Form !
  const isWaterBased = data.type_pac === "Air/Eau" || data.type_pac === "Eau/Eau"
  if (isWaterBased && !data.temperature_depart) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La température est requise",
      path: ["temperature_depart"],
    })
  }
})
```

**Pourquoi ça ne fonctionne pas** :
- Les erreurs ajoutées via `ctx.addIssue()` dans `superRefine` ne sont **pas reconnues** par React Hook Form
- Le composant `<FormMessage />` ne reçoit jamais ces erreurs
- La validation Zod réussit techniquement, mais les erreurs custom ne se propagent pas à l'UI

**Analyse détaillée** :
1. React Hook Form utilise le résultat de la validation Zod
2. `superRefine` ajoute des "issues" custom à l'objet d'erreur Zod
3. Mais ces issues custom ne sont pas correctement mappées aux champs dans le formulaire
4. Le `zodResolver` ne transmet pas ces erreurs custom à `formState.errors`
5. Donc `<FormMessage />` reste vide car `fieldState.error` est `undefined`

**Conclusion** : `superRefine` n'est pas compatible avec React Hook Form pour afficher des erreurs de champs individuels.

#### ✅ BONNE SOLUTION : Union discriminée (Discriminated Union)

La solution est d'utiliser des **schémas séparés** pour chaque cas et de les combiner avec `z.discriminatedUnion()` :

```typescript
// ✅ SOLUTION : Schémas séparés basés sur un discriminant
import { z } from "zod"

// Champs communs à tous les types
const baseFields = {
  type_pac: z.enum(["Air/Eau", "Eau/Eau", "Air/Air"], {
    message: "Le type de PAC est requis",
  }),
  puissance_pac_kw: z
    .number({ message: "La puissance est requise" })
    .min(1),
  // ... autres champs communs
}

// Schéma pour PAC hydrauliques (Air/Eau et Eau/Eau)
// → température et émetteurs REQUIS
const waterBasedPacSchema = z.object({
  ...baseFields,
  temperature_depart: z
    .number({ message: "La température de départ est requise" })
    .min(30, "La température doit être d'au moins 30°C")
    .max(80, "La température ne peut pas dépasser 80°C"),
  emetteurs: z.enum([
    "Radiateurs haute température",
    "Radiateurs basse température",
    "Plancher chauffant",
    "Ventilo-convecteurs",
  ], {
    message: "Le type d'émetteurs est requis",
  }),
})

// Schéma pour PAC Air/Air
// → température et émetteurs optionnels (non affichés dans l'UI)
const airToAirPacSchema = z.object({
  ...baseFields,
  temperature_depart: z.number().optional(),
  emetteurs: z.enum([
    "Radiateurs haute température",
    "Radiateurs basse température",
    "Plancher chauffant",
    "Ventilo-convecteurs",
  ]).optional(),
})

// Union discriminée basée sur le champ "type_pac"
export const heatPumpProjectSchema = z.discriminatedUnion("type_pac", [
  waterBasedPacSchema.extend({ type_pac: z.literal("Air/Eau") }),
  waterBasedPacSchema.extend({ type_pac: z.literal("Eau/Eau") }),
  airToAirPacSchema.extend({ type_pac: z.literal("Air/Air") }),
])

export type HeatPumpProjectData = z.infer<typeof heatPumpProjectSchema>
```

**Avantages** :
- ✅ Les erreurs de validation s'affichent correctement
- ✅ Les messages d'erreur personnalisés en français fonctionnent
- ✅ La validation est type-safe (TypeScript sait quels champs sont requis selon le type)
- ✅ Pattern utilisé dans tout le projet (voir `currentHeatingSchema.ts`)

**Principe** :
1. Le champ discriminant (`type_pac`) détermine quel schéma appliquer
2. Chaque valeur du discriminant a son propre schéma avec les champs requis spécifiques
3. Zod sélectionne automatiquement le bon schéma selon la valeur du discriminant
4. React Hook Form affiche correctement les erreurs pour chaque schéma

**Exemple concret** :
- Si `type_pac === "Air/Eau"` → `waterBasedPacSchema` s'applique → `temperature_depart` est requis
- Si `type_pac === "Air/Air"` → `airToAirPacSchema` s'applique → `temperature_depart` est optionnel

**Comment ça fonctionne dans le code** :
1. L'utilisateur sélectionne un type de PAC dans le Select
2. React Hook Form met à jour `form.watch("type_pac")`
3. Si `type_pac === "Air/Eau"` ou `"Eau/Eau"` → le composant affiche les champs `temperature_depart` et `emetteurs`
4. Zod sélectionne automatiquement `waterBasedPacSchema` pour la validation
5. Les champs sont validés comme **requis** par le schéma
6. Les erreurs s'affichent correctement dans `<FormMessage />`

**Références** :
- Voir [heatPumpProjectSchema.ts](../app/(main)/projects/[projectId]/[step]/sections/heatPumpProject/heatPumpProjectSchema.ts) pour l'implémentation complète
- Voir [currentHeatingSchema.ts](../app/(main)/projects/[projectId]/[step]/sections/currentHeating/currentHeatingSchema.ts) pour un autre exemple avec 10 schémas différents

#### Résumé : Checklist pour champs conditionnellement requis

1. ❌ **Ne pas utiliser** `.optional()` + `.superRefine()`
2. ✅ **Créer** des champs communs dans `baseFields`
3. ✅ **Créer** un schéma séparé pour chaque cas (avec les champs requis spécifiques)
4. ✅ **Utiliser** `z.discriminatedUnion()` pour combiner les schémas
5. ✅ **Masquer** les champs non applicables dans l'UI avec des conditions (`{isWaterBased && ...}`)
6. ✅ **Tester** que les erreurs s'affichent correctement pour chaque cas

## Références

- [Zod Documentation](https://zod.dev/)
- [React Hook Form - Zod Resolver](https://react-hook-form.com/get-started#SchemaValidation)
- [Shadcn/ui Forms](https://ui.shadcn.com/docs/components/form)

---

**Dernière mise à jour**: 28 novembre 2024
**Auteur**: Équipe ThermoGain
