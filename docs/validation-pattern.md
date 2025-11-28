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

      {/* Select */}
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
    </Form>
  )
}
```

## Checklist de validation

Pour chaque champ obligatoire :

- [ ] ❌ Supprimer `.default()` du schéma Zod
- [ ] ✅ Ajouter `{ message: "..." }` dans la définition du type
- [ ] ✅ Utiliser `value={field.value ?? ""}` dans l'input
- [ ] ✅ Convertir `""` → `undefined` dans le `onChange`
- [ ] ✅ Déstructurer manuellement les props du field au lieu d'utiliser `{...field}`

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

## Références

- [Zod Documentation](https://zod.dev/)
- [React Hook Form - Zod Resolver](https://react-hook-form.com/get-started#SchemaValidation)
- [Shadcn/ui Forms](https://ui.shadcn.com/docs/components/form)

---

**Dernière mise à jour**: 28 novembre 2024
**Auteur**: Équipe ThermoGain
