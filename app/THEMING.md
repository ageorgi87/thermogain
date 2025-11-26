# ThermoGain - Guide de Thématisation

Ce guide explique comment fonctionne le système de thème de ThermoGain et comment le personnaliser.

## Architecture du Thème

Le système de thème suit les bonnes pratiques de shadcn/ui avec Tailwind CSS v4:

```
app/
├── globals.css       # Point d'entrée des styles, imports et configuration Tailwind
└── theme.css         # Définition complète du design system ThermoGain
```

### Fichiers Principaux

#### `app/theme.css`
Contient toutes les variables CSS du design system:
- **Couleurs de marque** : Palette orange/terracotta de ThermoGain
- **Couleurs sémantiques** : Variables shadcn/ui standard (background, foreground, etc.)
- **Typographie** : Tailles de police, poids, line-heights
- **Espacement** : Échelle d'espacement basée sur une grille de 4px
- **Border radius** : Valeurs de coins arrondis
- **Ombres** : Niveaux d'élévation
- **Transitions** : Durées et fonctions d'animation
- **Gradients** : Gradients de marque réutilisables

#### `app/globals.css`
Importe les dépendances et enregistre les variables CSS avec Tailwind:
- Import de Tailwind CSS
- Import des animations
- Import du thème ThermoGain
- Configuration de la variante dark mode
- Enregistrement des variables avec `@theme inline`
- Styles de base

## Utilisation des Couleurs

### Couleurs de Marque ThermoGain

Les couleurs orange/terracotta sont disponibles via des utilitaires Tailwind:

```tsx
// Background orange clair
<div className="bg-brand-orange-50">...</div>

// Texte orange primaire
<p className="text-brand-orange-600">...</p>

// Bordure orange
<div className="border-brand-orange-200">...</div>

// Hover avec orange
<button className="hover:bg-brand-orange-100">...</button>
```

#### Palette Complète

```css
brand-orange-50   /* Très clair - backgrounds */
brand-orange-100  /* Clair - hover states */
brand-orange-200  /* Bordures */
brand-orange-300  /* Hover states */
brand-orange-400  /* Medium */
brand-orange-500  /* Standard */
brand-orange-600  /* Primaire (défaut) */
brand-orange-700  /* Foncé */
brand-orange-800  /* Plus foncé */
brand-orange-900  /* Très foncé */

brand-red-600     /* Rouge pour gradients */
brand-red-700     /* Rouge foncé */
```

### Couleurs Sémantiques shadcn/ui

Utilisez les couleurs sémantiques pour les composants UI:

```tsx
// Surfaces et conteneurs
<Card className="bg-card text-card-foreground">...</Card>

// Actions primaires (noir pour ThermoGain)
<Button className="bg-primary text-primary-foreground">...</Button>

// États désactivés/mutés
<p className="text-muted-foreground">...</p>

// Actions destructives
<Button className="bg-destructive text-destructive-foreground">...</Button>
```

## Gradients

### Utilisation des Gradients Prédéfinis

Les gradients de marque sont disponibles comme variables CSS:

```tsx
// Texte avec gradient
<h1 className="bg-gradient-to-r from-brand-orange-600 to-brand-red-600 bg-clip-text text-transparent">
  ThermoGain
</h1>

// Background avec gradient
<div className="bg-gradient-to-br from-brand-orange-50 to-red-100">
  ...
</div>

// Avatar avec gradient
<div className="bg-gradient-to-br from-brand-orange-600 to-brand-red-600">
  AG
</div>
```

## Typographie

### Tailles de Police

Utilisez les utilitaires Tailwind standard:

```tsx
<p className="text-xs">12px</p>
<p className="text-sm">14px</p>
<p className="text-base">16px</p>
<p className="text-lg">18px</p>
<p className="text-xl">20px</p>
<p className="text-2xl">24px</p>
<p className="text-3xl">30px</p>
<p className="text-4xl">36px</p>
```

### Poids de Police

```tsx
<p className="font-normal">400</p>
<p className="font-medium">500</p>
<p className="font-semibold">600</p>
<p className="font-bold">700</p>
```

## Espacement

Système d'espacement basé sur une grille de 4px:

```tsx
<div className="p-4">padding: 16px</div>
<div className="m-6">margin: 24px</div>
<div className="gap-8">gap: 32px</div>
```

## Border Radius

```tsx
<div className="rounded-sm">6px</div>
<div className="rounded-md">8px</div>
<div className="rounded-lg">10px (défaut)</div>
<div className="rounded-xl">14px</div>
<div className="rounded-2xl">16px</div>
<div className="rounded-full">Circle complet</div>
```

## Dark Mode

Le thème supporte automatiquement le mode sombre via la classe `.dark`:

```tsx
// Couleurs qui s'adaptent automatiquement
<div className="bg-background text-foreground">
  // Blanc en light mode, noir en dark mode
</div>

// Variantes spécifiques dark mode
<div className="bg-orange-50 dark:bg-orange-950">
  // S'adapte au mode
</div>
```

## Modifier le Thème

### Changer une Couleur Existante

Éditez `/app/theme.css`:

```css
:root {
  /* Changer l'orange primaire */
  --brand-orange-600: oklch(0.65 0.20 45);  /* Nouvelle valeur */
}
```

### Ajouter une Nouvelle Couleur

1. Ajoutez la variable dans `theme.css`:

```css
:root {
  --brand-blue-600: oklch(0.50 0.18 250);
}

.dark {
  --brand-blue-600: oklch(0.70 0.18 250);
}
```

2. Enregistrez-la dans `globals.css`:

```css
@theme inline {
  /* ... autres couleurs ... */
  --color-brand-blue-600: var(--brand-blue-600);
}
```

3. Utilisez-la dans vos composants:

```tsx
<div className="bg-brand-blue-600">...</div>
```

### Changer le Border Radius Global

Dans `theme.css`:

```css
:root {
  --radius: 0.5rem;  /* Plus petit = coins plus carrés */
  /* ou */
  --radius: 1rem;    /* Plus grand = coins plus arrondis */
}
```

## Bonnes Pratiques

### ✅ À Faire

- Utiliser les couleurs sémantiques (`bg-background`, `text-foreground`) pour les éléments standards
- Utiliser les couleurs de marque (`brand-orange-*`) pour les accents et éléments de marque
- Garder les titres et CTAs en noir (`text-foreground`) pour l'accessibilité
- Utiliser l'orange comme couleur d'accent, pas comme couleur primaire
- Tester en mode clair ET mode sombre

### ❌ À Éviter

- Ne pas hard-coder les valeurs de couleur directement (`bg-[#C66140]`)
- Ne pas dupliquer les définitions de couleurs
- Ne pas ignorer les contraintes d'accessibilité (contraste suffisant)
- Ne pas mélanger les approches de thème (rester cohérent avec les variables CSS)

## Exemples de Composants Stylés

### Card avec Accent Orange

```tsx
<Card className="shadow-2xl border-2">
  <CardContent className="pt-6">
    <div className="mb-6 p-4 bg-brand-orange-50 dark:bg-brand-orange-950 rounded-full">
      <Calculator className="h-12 w-12 text-brand-orange-600 dark:text-brand-orange-400" />
    </div>
    <h3 className="text-xl font-semibold mb-2">Titre</h3>
    <p className="text-muted-foreground">Description...</p>
  </CardContent>
</Card>
```

### Button avec Hover Orange

```tsx
<Button
  variant="ghost"
  className="hover:bg-brand-orange-50 dark:hover:bg-brand-orange-950 hover:text-brand-orange-600"
>
  <Eye className="h-4 w-4" />
</Button>
```

### Badge avec Gradient

```tsx
<Badge className="bg-gradient-to-r from-brand-orange-600 to-brand-red-600 text-white border-0">
  En cours
</Badge>
```

### Avatar avec Gradient de Marque

```tsx
<Avatar className="h-9 w-9 border-2 border-brand-orange-200 hover:border-brand-orange-300">
  <AvatarFallback className="bg-gradient-to-br from-brand-orange-600 to-brand-red-600 text-white">
    AG
  </AvatarFallback>
</Avatar>
```

## Ressources

- [Documentation shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [OKLCH Color Format](https://oklch.com/)
- [Contrast Checker (Accessibilité)](https://webaim.org/resources/contrastchecker/)

## Support

Pour toute question sur le système de thème, consultez:
- Le fichier `app/theme.css` pour voir toutes les variables disponibles
- Le fichier `app/globals.css` pour comprendre comment elles sont enregistrées
- Les composants existants pour des exemples d'utilisation
