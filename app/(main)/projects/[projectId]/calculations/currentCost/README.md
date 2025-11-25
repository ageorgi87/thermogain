# Module Coût Actuel (currentCost)

## Description

Ce module calcule le coût annuel du chauffage actuel du logement, en tenant compte du type de chauffage utilisé, de la consommation énergétique, et de l'évolution des prix de l'énergie. Il permet d'établir une baseline pour comparer avec le coût futur d'une installation PAC.

## Fonctions exportées

### `calculateCurrentAnnualCost(data: ProjectData): number`

Calcule le coût annuel du chauffage actuel en multipliant la consommation par le prix unitaire de l'énergie.

**Paramètres:**
- `data` (ProjectData): Objet contenant toutes les données du projet
  - `type_chauffage` (string): Type de chauffage actuel ("Fioul", "Gaz", "GPL", "Pellets", "Bois", "Electrique", "PAC Air/Air", "PAC Air/Eau", "PAC Eau/Eau")
  - `conso_fioul_litres` (number, optionnel): Consommation annuelle de fioul en litres
  - `prix_fioul_litre` (number, optionnel): Prix du fioul en €/litre
  - `conso_gaz_kwh` (number, optionnel): Consommation annuelle de gaz en kWh
  - `prix_gaz_kwh` (number, optionnel): Prix du gaz en €/kWh
  - `conso_gpl_kg` (number, optionnel): Consommation annuelle de GPL en kg
  - `prix_gpl_kg` (number, optionnel): Prix du GPL en €/kg
  - `conso_pellets_kg` (number, optionnel): Consommation annuelle de pellets en kg
  - `prix_pellets_kg` (number, optionnel): Prix des pellets en €/kg
  - `conso_bois_steres` (number, optionnel): Consommation annuelle de bois en stères
  - `prix_bois_stere` (number, optionnel): Prix du bois en €/stère
  - `conso_elec_kwh` (number, optionnel): Consommation annuelle d'électricité en kWh
  - `prix_elec_kwh` (number, optionnel): Prix de l'électricité en €/kWh
  - `conso_pac_kwh` (number, optionnel): Consommation annuelle de la PAC en kWh (si déjà équipé)

**Retourne:**
- `number`: Coût annuel du chauffage actuel en euros

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  // ... autres champs
}

const coutAnnuel = calculateCurrentAnnualCost(data)
// Résultat: 1500 € (15000 kWh × 0.10 €/kWh)
```

---

### `getCurrentEnergyEvolution(data: ProjectData): number`

Obtient le taux d'évolution annuel du prix de l'énergie actuelle utilisée pour le chauffage.

**Paramètres:**
- `data` (ProjectData): Objet contenant toutes les données du projet
  - `type_chauffage` (string): Type de chauffage actuel
  - `evolution_prix_fioul` (number, optionnel): Taux d'évolution annuel du prix du fioul en %
  - `evolution_prix_gaz` (number, optionnel): Taux d'évolution annuel du prix du gaz en %
  - `evolution_prix_gpl` (number, optionnel): Taux d'évolution annuel du prix du GPL en %
  - `evolution_prix_bois` (number, optionnel): Taux d'évolution annuel du prix du bois/pellets en %
  - `evolution_prix_electricite` (number): Taux d'évolution annuel du prix de l'électricité en %

**Retourne:**
- `number`: Taux d'évolution annuel en pourcentage (ex: 3 pour 3% par an)

**Exemple:**
```typescript
const data = {
  type_chauffage: "Fioul",
  evolution_prix_fioul: 3,
  // ... autres champs
}

const evolution = getCurrentEnergyEvolution(data)
// Résultat: 3 (3% par an)
```

---

### `calculateCurrentCostForYear(data: ProjectData, year: number): number`

Calcule le coût projeté du chauffage actuel pour une année donnée, en tenant compte de l'évolution des prix de l'énergie.

**Paramètres:**
- `data` (ProjectData): Objet contenant toutes les données du projet
- `year` (number): Année de projection (0 = année actuelle, 1 = année suivante, etc.)

**Retourne:**
- `number`: Coût projeté en euros pour l'année spécifiée

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  evolution_prix_gaz: 4,
  // ... autres champs
}

const coutAnnee0 = calculateCurrentCostForYear(data, 0)
// Résultat: 1500 € (année actuelle)

const coutAnnee5 = calculateCurrentCostForYear(data, 5)
// Résultat: 1824.98 € (après 5 ans avec +4% par an)
// Formule: 1500 × (1 + 0.04)^5
```

## Logique de calcul

### Calcul du coût annuel actuel

Le coût annuel est calculé en multipliant la consommation énergétique par le prix unitaire de l'énergie:

```
Coût annuel = Consommation × Prix unitaire
```

La fonction `calculateCurrentAnnualCost` utilise un `switch` sur le type de chauffage pour sélectionner les bonnes données de consommation et de prix.

**Unités utilisées:**
- **Fioul**: litres × €/litre
- **Gaz**: kWh × €/kWh
- **GPL**: kg × €/kg
- **Pellets**: kg × €/kg
- **Bois**: stères × €/stère
- **Électricité**: kWh × €/kWh
- **PAC**: kWh × €/kWh

### Projection avec évolution des prix

Pour projeter le coût sur plusieurs années, on applique la formule de capitalisation composée:

```
Coût(année n) = Coût de base × (1 + taux d'évolution)^n
```

Où:
- `Coût de base` = coût annuel actuel calculé avec `calculateCurrentAnnualCost()`
- `taux d'évolution` = taux annuel en décimal (ex: 0.04 pour 4%)
- `n` = nombre d'années depuis l'année de référence

**Exemple de calcul:**
- Coût de base: 1500 €
- Évolution: +4% par an
- Année 5: `1500 × (1.04)^5 = 1500 × 1.2166 = 1824.98 €`

## Raisons techniques

### Pourquoi séparer les unités par type de chauffage?

Chaque type d'énergie a ses propres unités de mesure standard:
- Le **fioul** se mesure en litres (relevé de cuve)
- Le **gaz naturel** se mesure en kWh (compteur)
- Le **GPL** se mesure en kg (bonbonne)
- Les **pellets** se mesurent en kg (sacs)
- Le **bois** se mesure en stères (bûches)
- L'**électricité** se mesure en kWh (compteur)

Utiliser les unités natives permet:
1. Une saisie intuitive pour l'utilisateur (format des factures)
2. Une meilleure précision (pas de conversion intermédiaire)
3. Une maintenance facilitée (ajout de nouveaux types d'énergie)

### Pourquoi calculer l'évolution des prix?

Les projections financières sur 15-20 ans (durée de vie d'une PAC) doivent tenir compte de l'évolution prévisible des prix de l'énergie.

**Justification économique:**
- Les prix de l'énergie ne sont pas stables (historique sur 10 ans: +2% à +4% par an)
- Ignorer cette évolution sous-estime drastiquement les économies futures
- Les énergies fossiles (fioul, gaz) ont tendance à augmenter plus rapidement que l'électricité

**Source des taux d'évolution:**
Les taux sont calculés à partir des données historiques sur 10 ans de l'API DIDO-SDES (Service des Données et Études Statistiques du Ministère de la Transition Écologique).

### Pourquoi une fonction séparée pour obtenir l'évolution?

La fonction `getCurrentEnergyEvolution()` encapsule la logique de sélection du taux d'évolution approprié selon le type de chauffage. Cela permet:
- **Réutilisation**: Le taux d'évolution est utilisé dans plusieurs modules (currentCost, savings, roi)
- **Maintenance**: Facile de modifier les taux ou d'ajouter de nouveaux types d'énergie
- **Testabilité**: Fonction pure facile à tester unitairement

## Exemples d'utilisation

### Cas 1: Chauffage au gaz

```typescript
import { calculateCurrentAnnualCost, calculateCurrentCostForYear } from './currentCost'

const projectData = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  evolution_prix_gaz: 4,
  // ... autres champs requis pour ProjectData
}

// Coût actuel
const coutActuel = calculateCurrentAnnualCost(projectData)
console.log(`Coût annuel actuel: ${coutActuel} €`)
// Affiche: "Coût annuel actuel: 1500 €"

// Projection sur 10 ans
for (let year = 0; year <= 10; year++) {
  const cout = calculateCurrentCostForYear(projectData, year)
  console.log(`Année ${year}: ${Math.round(cout)} €`)
}
// Affiche:
// Année 0: 1500 €
// Année 1: 1560 €
// Année 2: 1622 €
// ...
// Année 10: 2220 €
```

### Cas 2: Chauffage au fioul

```typescript
const projectDataFioul = {
  type_chauffage: "Fioul",
  conso_fioul_litres: 2000,
  prix_fioul_litre: 1.15,
  evolution_prix_fioul: 3,
  // ... autres champs
}

const coutFioul = calculateCurrentAnnualCost(projectDataFioul)
console.log(`Coût annuel fioul: ${coutFioul} €`)
// Affiche: "Coût annuel fioul: 2300 €"

const coutDans5Ans = calculateCurrentCostForYear(projectDataFioul, 5)
console.log(`Coût projeté dans 5 ans: ${Math.round(coutDans5Ans)} €`)
// Affiche: "Coût projeté dans 5 ans: 2665 €"
```

### Cas 3: PAC existante

```typescript
const projectDataPac = {
  type_chauffage: "PAC Air/Eau",
  conso_pac_kwh: 4000,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3,
  // ... autres champs
}

const coutPac = calculateCurrentAnnualCost(projectDataPac)
console.log(`Coût annuel PAC actuelle: ${coutPac} €`)
// Affiche: "Coût annuel PAC actuelle: 840 €"
```

### Cas 4: Calcul avec tous les types d'énergie

```typescript
const energyTypes = [
  { type: "Fioul", conso: 2000, unit: "litres", prix: 1.15, evolution: 3 },
  { type: "Gaz", conso: 15000, unit: "kWh", prix: 0.10, evolution: 4 },
  { type: "Electrique", conso: 10000, unit: "kWh", prix: 0.21, evolution: 3 },
]

energyTypes.forEach(energy => {
  const data = {
    type_chauffage: energy.type,
    [`conso_${energy.type.toLowerCase()}_${energy.unit}`]: energy.conso,
    [`prix_${energy.type.toLowerCase()}_${energy.unit.slice(0, -1)}`]: energy.prix,
    [`evolution_prix_${energy.type.toLowerCase()}`]: energy.evolution,
  }

  const coutActuel = calculateCurrentAnnualCost(data)
  const coutFutur = calculateCurrentCostForYear(data, 10)

  console.log(`${energy.type}: ${coutActuel}€ → ${Math.round(coutFutur)}€ (+${energy.evolution}% par an)`)
})
```

## Dépendances

### Imports
```typescript
import { ProjectData } from "./types"
```

### Modules utilisés
- **types.ts**: Définition de l'interface `ProjectData` qui contient toutes les données du projet

### Dépendances externes
Aucune dépendance externe. Ce module n'utilise que des calculs mathématiques standards de JavaScript.

### Modules qui dépendent de currentCost
- **pacCost.ts**: Utilise `calculateCurrentAnnualCost` pour comparer avec le coût PAC
- **savings.ts**: Utilise `calculateCurrentCostForYear` pour calculer les économies année par année
- **index.ts**: Réexporte toutes les fonctions du module

## Notes importantes

1. **Valeurs par défaut**: Si une consommation ou un prix est manquant (undefined), la fonction retourne 0 grâce à l'opérateur `||`

2. **Précision**: Les calculs utilisent les nombres flottants JavaScript. Pour l'affichage, il est recommandé d'arrondir les résultats avec `Math.round()`

3. **Validation**: Ce module ne valide pas les données d'entrée. La validation doit être effectuée en amont (formulaire, API)

4. **Performance**: Les fonctions sont pures et sans effet de bord, ce qui les rend performantes et facilement cacheable

## Améliorations futures possibles

1. **Historique**: Ajouter une fonction pour récupérer l'historique réel des coûts sur plusieurs années
2. **Inflation**: Intégrer un taux d'inflation général en plus de l'évolution spécifique de l'énergie
3. **Saisonnalité**: Prendre en compte les variations saisonnières de consommation
4. **Abonnement**: Intégrer le coût de l'abonnement en plus du coût de consommation
