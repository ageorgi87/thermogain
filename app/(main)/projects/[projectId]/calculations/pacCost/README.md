# Module Coût PAC (pacCost)

## Description

Ce module calcule le coût annuel de fonctionnement d'une pompe à chaleur (PAC), ainsi que les projections de coût sur plusieurs années en tenant compte de l'évolution du prix de l'électricité. Il fournit également des fonctions auxiliaires pour convertir les consommations énergétiques actuelles en équivalent kWh thermique.

Ce module est essentiel pour comparer le coût de la PAC avec le système de chauffage actuel et calculer les économies potentielles.

## Fonctions exportées

### `calculateCurrentConsumptionKwh(data: ProjectData): number`

Convertit la consommation énergétique actuelle (tous combustibles) en équivalent kWh thermique.

**Paramètres:**
- `data` (ProjectData): Objet contenant les données du projet
  - `type_chauffage` (string): Type de chauffage actuel
  - Consommations spécifiques selon le type de chauffage (voir détails ci-dessous)

**Retourne:**
- `number`: Consommation énergétique en kWh thermique

**Exemple:**
```typescript
const data = {
  type_chauffage: "Fioul",
  conso_fioul_litres: 2000,
  // ... autres champs
}

const besoinsKwh = calculateCurrentConsumptionKwh(data)
// Résultat: 20000 kWh (2000 L × 10 kWh/L)
```

---

### `calculatePacConsumptionKwh(data: ProjectData): number`

Calcule la consommation électrique de la PAC en kWh en divisant les besoins thermiques par le COP estimé.

**Paramètres:**
- `data` (ProjectData): Objet contenant les données du projet
  - `cop_estime` (number): Coefficient de Performance estimé de la PAC

**Retourne:**
- `number`: Consommation électrique de la PAC en kWh/an

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.0,
  // ... autres champs
}

const consoPac = calculatePacConsumptionKwh(data)
// Résultat: 5000 kWh (15000 / 3.0)
```

---

### `calculatePacAnnualCost(data: ProjectData): number`

Calcule le coût annuel de fonctionnement de la PAC (année 1).

**Paramètres:**
- `data` (ProjectData): Objet contenant les données du projet
  - `prix_elec_kwh` (number, optionnel): Prix de l'électricité en €/kWh

**Retourne:**
- `number`: Coût annuel en euros

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  // ... autres champs
}

const coutPac = calculatePacAnnualCost(data)
// Résultat: 1050 € (5000 kWh × 0.21 €/kWh)
```

---

### `calculatePacCostForYear(data: ProjectData, year: number): number`

Calcule le coût projeté de la PAC pour une année donnée, en tenant compte de l'évolution du prix de l'électricité.

**Paramètres:**
- `data` (ProjectData): Objet contenant les données du projet
  - `evolution_prix_electricite` (number, optionnel): Taux d'évolution annuel du prix de l'électricité en %
- `year` (number): Année de projection (0 = année actuelle, 1 = année suivante, etc.)

**Retourne:**
- `number`: Coût projeté en euros

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3, // +3% par an
  // ... autres champs
}

const coutAnnee0 = calculatePacCostForYear(data, 0)
// Résultat: 1050 €

const coutAnnee10 = calculatePacCostForYear(data, 10)
// Résultat: 1411 € (1050 × (1.03)^10)
```

## Logique de calcul

### 1. Conversion en kWh thermique

La fonction `calculateCurrentConsumptionKwh` convertit toutes les sources d'énergie en kWh thermique pour permettre des comparaisons.

**Facteurs de conversion:**

| Combustible | Facteur | Formule | Source |
|-------------|---------|---------|--------|
| **Fioul** | 10 kWh/L | `litres × 10` | PCI ADEME |
| **Gaz** | 1 kWh/kWh | `kWh × 1` | Direct compteur |
| **GPL** | 12.8 kWh/kg | `kg × 12.8` | PCI ADEME |
| **Pellets** | 4.8 kWh/kg | `kg × 4.8` | PCI ADEME |
| **Bois** | 1800 kWh/stère | `stères × 1800` | PCI ADEME (bois sec) |
| **Électricité** | 1 kWh/kWh | `kWh × 1` | Rendement 100% |
| **PAC existante** | Recalculé | `kWh × COP actuel` | Retrouver besoins thermiques |

**Exemple de calcul:**
```typescript
// Fioul: 2000 litres
const besoins = 2000 × 10 = 20 000 kWh

// Gaz: 15000 kWh
const besoins = 15000 × 1 = 15 000 kWh

// GPL: 1500 kg
const besoins = 1500 × 12.8 = 19 200 kWh

// Pellets: 4000 kg
const besoins = 4000 × 4.8 = 19 200 kWh

// Bois: 10 stères
const besoins = 10 × 1800 = 18 000 kWh
```

**Note:** La valeur pour le bois est de 1800 kWh/stère dans ce module (vs 2000 kWh/stère dans pacConsumption). Cette différence devrait être harmonisée.

**Cas particulier - PAC existante:**
Si l'utilisateur a déjà une PAC, on retrouve les besoins thermiques réels:
```
Besoins thermiques = Consommation électrique actuelle × COP actuel
```

Exemple:
```typescript
// PAC actuelle: 5000 kWh élec, COP 2.5
const besoins = 5000 × 2.5 = 12 500 kWh thermiques
```

### 2. Calcul de la consommation PAC

Une fois les besoins thermiques connus, la consommation électrique de la nouvelle PAC se calcule:

```
Consommation PAC = Besoins thermiques / COP estimé
```

**Exemple:**
```typescript
// Besoins: 15 000 kWh
// COP: 3.0
const consoPac = 15000 / 3.0 = 5000 kWh élec/an
```

**Gain énergétique:**
- Chauffage électrique direct: 15 000 kWh
- PAC (COP 3.0): 5 000 kWh
- **Réduction: 66.7%**

### 3. Calcul du coût annuel

Le coût annuel se calcule simplement:

```
Coût annuel PAC = Consommation PAC × Prix électricité
```

**Exemple:**
```typescript
// Consommation: 5000 kWh
// Prix: 0.21 €/kWh
const cout = 5000 × 0.21 = 1050 €/an
```

### 4. Projection avec évolution des prix

Pour projeter le coût sur plusieurs années, on applique la formule de capitalisation composée:

```
Coût(année n) = Coût de base × (1 + évolution)^n
```

Où:
- `Coût de base` = coût année 0 calculé avec `calculatePacAnnualCost()`
- `évolution` = taux annuel en décimal (ex: 0.03 pour 3%)
- `n` = nombre d'années

**Exemple sur 10 ans avec +3% par an:**
```typescript
const coutBase = 1050 // €
const evolution = 0.03 // 3%

// Année 0: 1050 €
// Année 1: 1050 × 1.03 = 1081.50 €
// Année 2: 1050 × 1.03² = 1113.95 €
// ...
// Année 10: 1050 × 1.03^10 = 1411.40 €
```

## Raisons techniques

### Pourquoi deux fonctions pour calculer la consommation PAC?

Il existe deux fonctions qui calculent la consommation PAC:
1. **`calculatePacConsumptionKwh` (pacCost.ts)**: Utilise le COP estimé brut sans ajustements
2. **`calculatePacConsumptionKwh` (pacConsumption.ts)**: Utilise le COP ajusté selon température, émetteurs, climat

**Raison de cette duplication:**
- pacCost.ts: Calcul simplifié pour les coûts financiers de base
- pacConsumption.ts: Calcul précis avec tous les ajustements

**Recommandation:** Unifier ces deux fonctions en utilisant systématiquement la version avec COP ajusté de pacConsumption.ts.

### Pourquoi séparer calculateCurrentConsumptionKwh?

Cette fonction utilitaire permet de:
1. **Réutilisation**: D'autres modules peuvent avoir besoin de convertir en kWh thermique
2. **Clarté**: Sépare la logique de conversion de la logique de calcul PAC
3. **Testabilité**: Facile à tester indépendamment
4. **Maintenance**: Un seul endroit où gérer les facteurs de conversion

### Pourquoi utiliser des valeurs par défaut (|| 0)?

```typescript
const currentConsumptionKwh = calculateCurrentConsumptionKwh(data)
return currentConsumptionKwh / data.cop_estime
```

L'opérateur `|| 0` garantit que:
- Si une valeur est `undefined`, on utilise 0 au lieu de NaN
- Le calcul ne plante pas avec des données incomplètes
- Le résultat est toujours un nombre valide

**Limitation:** Cela masque les erreurs de données. Une validation explicite serait préférable en production.

### Pourquoi stocker currentConsumptionKwh dans calculatePacConsumptionKwh?

```typescript
const currentConsumptionKwh = calculateCurrentConsumptionKwh(data)
return currentConsumptionKwh / data.cop_estime
```

Plutôt que:
```typescript
return calculateCurrentConsumptionKwh(data) / data.cop_estime
```

Avantages:
1. **Debugging**: Plus facile à debugger avec une variable intermédiaire
2. **Performance**: Évite le recalcul si utilisé plusieurs fois
3. **Lisibilité**: Code plus clair et explicite

## Exemples d'utilisation

### Cas 1: Remplacement chaudière gaz

```typescript
import { calculatePacAnnualCost, calculatePacCostForYear } from './pacCost'

const projet = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3,
  // ... autres champs
}

// Coût année 1
const coutAnnee1 = calculatePacAnnualCost(projet)
console.log(`Coût PAC année 1: ${coutAnnee1} €`)
// Affiche: "Coût PAC année 1: 1050 €"

// Projection sur 15 ans (durée de vie PAC)
console.log("\nProjection coûts PAC:")
for (let year = 0; year <= 15; year += 5) {
  const cout = calculatePacCostForYear(projet, year)
  console.log(`Année ${year}: ${Math.round(cout)} €`)
}
// Affiche:
// Année 0: 1050 €
// Année 5: 1217 €
// Année 10: 1411 €
// Année 15: 1636 €
```

### Cas 2: Comparaison coût actuel vs PAC

```typescript
import { calculateCurrentAnnualCost } from '../currentCost/currentCost'
import { calculatePacAnnualCost } from './pacCost'

const data = {
  type_chauffage: "Fioul",
  conso_fioul_litres: 2000,
  prix_fioul_litre: 1.15,
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  // ... autres champs
}

const coutActuel = calculateCurrentAnnualCost(data)
const coutPac = calculatePacAnnualCost(data)
const economie = coutActuel - coutPac

console.log(`Coût annuel fioul: ${coutActuel} €`)
console.log(`Coût annuel PAC: ${coutPac} €`)
console.log(`Économie: ${economie} € (${Math.round(economie/coutActuel*100)}%)`)

// Résultat:
// Coût annuel fioul: 2300 €
// Coût annuel PAC: 1400 €
// Économie: 900 € (39%)
```

### Cas 3: Évolution comparative sur 15 ans

```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  evolution_prix_gaz: 4, // +4% par an
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3, // +3% par an
}

console.log("Année | Gaz | PAC | Économie")
console.log("------|-----|-----|----------")

for (let year = 0; year <= 15; year += 3) {
  const coutGaz = calculateCurrentCostForYear(data, year)
  const coutPac = calculatePacCostForYear(data, year)
  const economie = coutGaz - coutPac

  console.log(`${year.toString().padStart(2)} | ${Math.round(coutGaz)}€ | ${Math.round(coutPac)}€ | ${Math.round(economie)}€`)
}

// Résultat:
// Année | Gaz | PAC | Économie
// ------|-----|-----|----------
//  0    | 1500€ | 1050€ | 450€
//  3    | 1687€ | 1147€ | 540€
//  6    | 1898€ | 1253€ | 645€
//  9    | 2136€ | 1369€ | 767€
// 12    | 2404€ | 1496€ | 908€
// 15    | 2706€ | 1635€ | 1071€

// Observation: L'écart augmente avec le temps car le gaz augmente plus vite (+4%) que l'électricité (+3%)
```

### Cas 4: Impact du COP sur le coût

```typescript
const cops = [2.5, 3.0, 3.5, 4.0]

const baseData = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_elec_kwh: 0.21,
}

console.log("COP | Conso PAC | Coût annuel | vs COP 3.0")
console.log("----|-----------|-------------|------------")

cops.forEach(cop => {
  const data = { ...baseData, cop_estime: cop }
  const conso = calculatePacConsumptionKwh(data)
  const cout = calculatePacAnnualCost(data)
  const diffVsRef = cout - (15000 / 3.0 * 0.21)

  console.log(
    `${cop.toFixed(1)} | ${conso} kWh | ${Math.round(cout)} € | ${diffVsRef > 0 ? '+' : ''}${Math.round(diffVsRef)} €`
  )
})

// Résultat:
// COP | Conso PAC | Coût annuel | vs COP 3.0
// ----|-----------|-------------|------------
// 2.5 | 6000 kWh  | 1260 €      | +210 €
// 3.0 | 5000 kWh  | 1050 €      | 0 €
// 3.5 | 4286 kWh  | 900 €       | -150 €
// 4.0 | 3750 kWh  | 788 €       | -262 €

// Observation: Chaque 0.5 de COP en plus économise ~150-200€/an
```

### Cas 5: Conversion de différentes énergies en kWh

```typescript
import { calculateCurrentConsumptionKwh } from './pacCost'

const energies = [
  { type: "Fioul", conso_fioul_litres: 2000 },
  { type: "Gaz", conso_gaz_kwh: 15000 },
  { type: "GPL", conso_gpl_kg: 1500 },
  { type: "Pellets", conso_pellets_kg: 4000 },
  { type: "Bois", conso_bois_steres: 10 },
]

console.log("Énergie | Consommation | Équivalent kWh")
console.log("--------|--------------|---------------")

energies.forEach(energy => {
  const data = { type_chauffage: energy.type, ...energy }
  const kWh = calculateCurrentConsumptionKwh(data)
  const unit = Object.keys(energy)[1].split('_')[2]

  console.log(`${energy.type.padEnd(8)} | ${energy[Object.keys(energy)[1]]} ${unit} | ${kWh.toLocaleString()} kWh`)
})

// Résultat:
// Énergie | Consommation | Équivalent kWh
// --------|--------------|---------------
// Fioul   | 2000 litres  | 20,000 kWh
// Gaz     | 15000 kWh    | 15,000 kWh
// GPL     | 1500 kg      | 19,200 kWh
// Pellets | 4000 kg      | 19,200 kWh
// Bois    | 10 steres    | 18,000 kWh
```

## Dépendances

### Imports
```typescript
import { ProjectData } from "./types"
import { calculateCurrentAnnualCost } from "./currentCost"
```

### Modules utilisés

#### types.ts
Définit l'interface `ProjectData` avec tous les champs nécessaires.

#### currentCost.ts
Utilisé uniquement dans les exemples de documentation, pas dans le code du module lui-même.

**Note:** Le module currentCost n'est pas importé dans pacCost.ts, ce qui montre une bonne séparation des responsabilités.

### Modules qui dépendent de pacCost

- **savings.ts**: Utilise `calculatePacCostForYear` pour calculer les économies année par année
- **index.ts**: Réexporte toutes les fonctions

## Notes importantes

### Différence avec pacConsumption.ts

**IMPORTANT:** Il existe deux modules qui calculent la consommation PAC:

1. **pacCost.ts** (ce module):
   - Utilise le COP estimé brut (sans ajustements)
   - Conversion simple: besoins / COP
   - Facteur bois: 1800 kWh/stère

2. **pacConsumption.ts**:
   - Utilise le COP ajusté (température, émetteurs, climat)
   - Calcul précis avec `calculateAdjustedCOP()`
   - Facteur bois: 2000 kWh/stère

**Recommandation:** Ces modules devraient être unifiés pour éviter les incohérences.

### Incohérence sur le facteur bois

Le facteur de conversion du bois est différent entre les modules:
- **pacCost.ts**: 1800 kWh/stère (plus conservateur)
- **pacConsumption.ts**: 2000 kWh/stère (valeur standard ADEME)

Cette différence peut créer des résultats légèrement différents. Il faudrait harmoniser sur une valeur unique (recommandé: 1900 kWh/stère comme compromis).

### Gestion des erreurs

Le module utilise l'opérateur `|| 0` pour gérer les valeurs manquantes, ce qui peut masquer des erreurs de données. Une validation explicite serait préférable:

```typescript
if (!data.cop_estime || data.cop_estime <= 0) {
  throw new Error("COP estimé invalide ou manquant")
}
```

### Division par zéro

Si `cop_estime` est 0, le calcul produit `Infinity`. Une vérification devrait être ajoutée:

```typescript
if (data.cop_estime === 0) return 0
```

## Améliorations futures possibles

1. **Unification**: Fusionner avec pacConsumption.ts en utilisant systématiquement le COP ajusté

2. **Harmonisation**: Utiliser les mêmes facteurs de conversion dans tous les modules

3. **Validation**: Ajouter des validations explicites des données d'entrée

4. **Tarification dynamique**: Intégrer les heures pleines/creuses pour un calcul plus précis

5. **Abonnement**: Ajouter le coût de l'abonnement électrique (fixe + variable)

6. **Entretien**: Intégrer le coût d'entretien annuel de la PAC (~100-150€/an)

7. **Mode dégradé**: Calculer le surcoût lié à l'utilisation de la résistance électrique d'appoint lors des pics de froid
