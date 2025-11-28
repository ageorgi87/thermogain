# Module Coût PAC (pacCost)

## Description

Ce module calcule le coût annuel de fonctionnement d'une pompe à chaleur (PAC), en séparant les **coûts variables** (électricité) et les **coûts fixes** (abonnements, entretien). Il gère également les projections de coût sur plusieurs années en tenant compte de l'évolution du prix de l'électricité.

**Nouveau (Novembre 2024)**: Le module intègre désormais:
- Le delta d'abonnement électricité (augmentation nécessaire pour la PAC)
- L'économie de suppression d'abonnement gaz (si applicable)
- Le coût d'entretien annuel de la PAC
- Une méthodologie de projection où seuls les coûts variables évoluent avec l'inflation énergétique

Il fournit également des fonctions auxiliaires pour convertir les consommations énergétiques actuelles en équivalent kWh thermique.

Ce module est essentiel pour comparer le coût de la PAC avec le système de chauffage actuel et calculer les économies potentielles de manière réaliste et complète.

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

### `calculatePacVariableCost(data: ProjectData): number`

**Nouvelle fonction (Novembre 2024)**: Calcule le coût VARIABLE annuel de la PAC (électricité uniquement, sans les coûts fixes).

**Paramètres:**
- `data` (ProjectData): Objet contenant les données du projet
  - `prix_elec_pac` (number, optionnel): Prix de l'électricité pour la PAC en €/kWh (si tarif spécifique)
  - `prix_elec_kwh` (number, optionnel): Prix de l'électricité actuel en €/kWh (utilisé si prix_elec_pac non renseigné)

**Retourne:**
- `number`: Coût variable annuel en euros

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.0,
  prix_elec_pac: 0.21,
  // ... autres champs
}

const coutVariable = calculatePacVariableCost(data)
// Résultat: 1050 € (5000 kWh × 0.21 €/kWh)
```

---

### `calculatePacFixedCosts(data: ProjectData): {...}`

**Nouvelle fonction (Novembre 2024)**: Calcule les coûts FIXES annuels de la PAC.

**Paramètres:**
- `data` (ProjectData): Objet contenant les données du projet
  - `puissance_souscrite_actuelle` (number, optionnel): Puissance souscrite actuelle en kVA (défaut: 6)
  - `puissance_souscrite_pac` (number, optionnel): Puissance souscrite nécessaire pour la PAC en kVA (défaut: 9)
  - `type_chauffage` (string): Type de chauffage actuel
  - `abonnement_gaz` (number, optionnel): Abonnement gaz annuel actuel en € (si type = "Gaz")
  - `entretien_pac_annuel` (number, optionnel): Coût d'entretien annuel PAC en € (défaut: 120)

**Retourne:**
- Objet avec:
  - `deltaAbonnementElec` (number): Augmentation abonnement électricité en €/an
  - `suppressionAbonnementGaz` (number): Économie suppression abonnement gaz en €/an (négatif = économie)
  - `entretien` (number): Coût entretien PAC en €/an
  - `total` (number): Total des coûts fixes en €/an

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  puissance_souscrite_actuelle: 6,  // 6 kVA actuel
  puissance_souscrite_pac: 9,       // 9 kVA pour PAC
  abonnement_gaz: 120,              // Abonnement gaz actuel
  entretien_pac_annuel: 150,        // Entretien PAC
  // ... autres champs
}

const coutsFixes = calculatePacFixedCosts(data)
// Résultat: {
//   deltaAbonnementElec: 53,    // +53€ pour passer de 6 à 9 kVA
//   suppressionAbonnementGaz: -120, // -120€ (économie)
//   entretien: 150,              // +150€ entretien
//   total: 83                    // 53 - 120 + 150 = 83€
// }
```

---

### `calculatePacAnnualCost(data: ProjectData): number`

Calcule le coût annuel TOTAL de fonctionnement de la PAC (année 1).
Inclut les coûts variables (électricité) ET les coûts fixes (delta abonnement + entretien - économie gaz).

**Paramètres:**
- `data` (ProjectData): Objet contenant les données du projet
  - Voir `calculatePacVariableCost` et `calculatePacFixedCosts` pour les champs utilisés

**Retourne:**
- `number`: Coût total annuel en euros

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.0,
  prix_elec_pac: 0.21,
  puissance_souscrite_actuelle: 6,
  puissance_souscrite_pac: 9,
  abonnement_gaz: 120,
  entretien_pac_annuel: 150,
  // ... autres champs
}

const coutTotal = calculatePacAnnualCost(data)
// Résultat: 1133 € (1050€ variable + 83€ fixe)
```

---

### `calculatePacCostForYear(data: ProjectData, year: number): number`

Calcule le coût projeté de la PAC pour une année donnée, en tenant compte de l'évolution du prix de l'électricité.

**IMPORTANT**: Seuls les coûts VARIABLES (électricité) évoluent avec le temps.
Les coûts FIXES (delta abonnement, entretien) restent constants en euros constants.

**Paramètres:**
- `data` (ProjectData): Objet contenant les données du projet
  - `evolution_prix_electricite` (number, optionnel): Taux d'évolution annuel du prix de l'électricité en %
  - Voir aussi les paramètres de `calculatePacVariableCost` et `calculatePacFixedCosts`
- `year` (number): Année de projection (0 = année actuelle, 1 = année suivante, etc.)

**Retourne:**
- `number`: Coût projeté en euros

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.0,
  prix_elec_pac: 0.21,
  evolution_prix_electricite: 3, // +3% par an
  puissance_souscrite_actuelle: 6,
  puissance_souscrite_pac: 9,
  abonnement_gaz: 120,
  entretien_pac_annuel: 150,
  // ... autres champs
}

const coutAnnee0 = calculatePacCostForYear(data, 0)
// Résultat: 1133 € (1050€ variable + 83€ fixe)

const coutAnnee10 = calculatePacCostForYear(data, 10)
// Résultat: 1494 € (1411€ variable × 1.03^10 + 83€ fixe inchangé)
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

**Nouveau modèle (Novembre 2024)**: Le coût annuel de la PAC se décompose en coûts VARIABLES et coûts FIXES.

#### 3.1. Coûts VARIABLES (électricité)

Ces coûts évoluent avec la consommation et le prix de l'énergie:

```
Coût variable PAC = Consommation PAC × Prix électricité PAC
```

**Exemple:**
```typescript
// Consommation: 5000 kWh
// Prix électricité PAC: 0.21 €/kWh
const coutVariable = 5000 × 0.21 = 1050 €/an
```

**Note:** Le système utilise en priorité `prix_elec_pac` s'il est renseigné (tarif spécifique comme heures creuses), sinon `prix_elec_kwh`.

#### 3.2. Coûts FIXES

Ces coûts restent constants en euros constants (n'évoluent pas avec le prix de l'énergie):

##### a) Delta abonnement électricité

Augmentation de l'abonnement électrique nécessaire pour la PAC:

```
Delta abonnement = Abonnement PAC - Abonnement actuel
```

**Exemple:**
```typescript
// Puissance actuelle: 6 kVA → 137.64 €/an (tarif Base EDF 2024)
// Puissance PAC: 9 kVA → 190.92 €/an
const deltaAbonnement = 190.92 - 137.64 = 53.28 €/an
```

Le barème EDF 2024 est stocké dans [`lib/subscriptionRates.ts`](../../../../../lib/subscriptionRates.ts).

##### b) Suppression abonnement gaz (si applicable)

Si le chauffage actuel est au gaz, l'abonnement gaz peut être supprimé:

```
Économie abonnement gaz = -abonnement_gaz
```

**Exemple:**
```typescript
// Abonnement gaz actuel: 120 €/an
const economieGaz = -120 €/an  // Négatif = économie
```

**Important:** Cette économie est CONDITIONNELLE:
- Uniquement si `type_chauffage === "Gaz"`
- Uniquement si on supprime COMPLÈTEMENT l'abonnement gaz (pas de chauffe-eau gaz résiduel, etc.)

##### c) Entretien PAC

Coût d'entretien annuel obligatoire de la PAC:

```
Entretien = entretien_pac_annuel
```

**Valeurs typiques:**
- PAC Air/Eau: 120-150 €/an
- PAC Eau/Eau: 150-200 €/an
- PAC Air/Air: 80-120 €/an

**Exemple:**
```typescript
const entretien = 150 €/an
```

#### 3.3. Coût total annuel

```
Coût total PAC = Coût variable + Coûts fixes totaux
```

Avec:
```
Coûts fixes totaux = Delta abonnement élec + Suppression abonnement gaz + Entretien
```

**Exemple complet:**
```typescript
// Coûts variables
const coutVariable = 1050 €

// Coûts fixes
const deltaAbonnement = 53 €
const suppressionGaz = -120 €  // Économie
const entretien = 150 €
const coutsFixes = 53 - 120 + 150 = 83 €

// Total
const coutTotal = 1050 + 83 = 1133 €/an
```

### 4. Projection avec évolution des prix

**MÉTHODOLOGIE IMPORTANTE (Novembre 2024):**

Seuls les **coûts VARIABLES** (électricité) évoluent avec le temps selon l'inflation énergétique.
Les **coûts FIXES** (abonnements, entretien) restent constants en **euros constants**.

```
Coût(année n) = [Coût variable × (1 + évolution)^n] + Coûts fixes
```

Où:
- `Coût variable` = consommation × prix électricité (année 0)
- `évolution` = taux annuel en décimal (ex: 0.03 pour 3%)
- `n` = nombre d'années
- `Coûts fixes` = delta abonnement + suppression gaz + entretien (constants)

**Exemple sur 10 ans avec +3% par an:**
```typescript
// Année 0
const coutVariable = 1050 €
const coutsFixes = 83 €
const total0 = 1050 + 83 = 1133 €

// Année 10
const evolution = 0.03 // 3%
const coutVariable10 = 1050 × (1.03)^10 = 1411 €
const coutsFixes10 = 83 €  // Inchangés!
const total10 = 1411 + 83 = 1494 €

// Détail par année:
// Année 0:  1050€ + 83€ = 1133 €
// Année 1:  1082€ + 83€ = 1165 €
// Année 2:  1114€ + 83€ = 1197 €
// ...
// Année 10: 1411€ + 83€ = 1494 €
```

**Justification méthodologique:**

En **euros constants**, les coûts fixes (abonnements, entretien) n'évoluent pas:
- Les abonnements sont des tarifs réglementés quasi-stables
- L'entretien suit l'inflation générale, pas l'inflation énergétique
- Seule la consommation d'énergie (électricité) suit la volatilité des prix de l'énergie

Cette approche est plus réaliste que d'appliquer l'inflation énergétique à tous les coûts.

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

### Cas 1: Remplacement chaudière gaz (avec coûts fixes)

**Nouveau (Novembre 2024)**: Exemple complet incluant les coûts fixes.

```typescript
import {
  calculatePacVariableCost,
  calculatePacFixedCosts,
  calculatePacAnnualCost,
  calculatePacCostForYear
} from './pacCost'

const projet = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.0,
  prix_elec_pac: 0.21,
  evolution_prix_electricite: 3,
  puissance_souscrite_actuelle: 6,  // kVA
  puissance_souscrite_pac: 9,       // kVA
  abonnement_gaz: 120,              // €/an
  entretien_pac_annuel: 150,        // €/an
  // ... autres champs
}

// Détail des coûts année 1
const coutVariable = calculatePacVariableCost(projet)
const coutsFixes = calculatePacFixedCosts(projet)
console.log("=== Décomposition coûts PAC année 1 ===")
console.log(`Coût variable (électricité): ${Math.round(coutVariable)} €`)
console.log(`  Delta abonnement élec: +${Math.round(coutsFixes.deltaAbonnementElec)} €`)
console.log(`  Suppression abonnement gaz: ${coutsFixes.suppressionAbonnementGaz} €`)
console.log(`  Entretien PAC: +${coutsFixes.entretien} €`)
console.log(`Coûts fixes totaux: ${Math.round(coutsFixes.total)} €`)
console.log(`TOTAL: ${Math.round(coutVariable + coutsFixes.total)} €`)

// Ou directement:
const coutTotal = calculatePacAnnualCost(projet)
console.log(`\nCoût total PAC année 1: ${Math.round(coutTotal)} €`)

// Affiche:
// === Décomposition coûts PAC année 1 ===
// Coût variable (électricité): 1050 €
//   Delta abonnement élec: +53 €
//   Suppression abonnement gaz: -120 €
//   Entretien PAC: +150 €
// Coûts fixes totaux: 83 €
// TOTAL: 1133 €
//
// Coût total PAC année 1: 1133 €

// Projection sur 15 ans (durée de vie PAC)
console.log("\n=== Projection coûts PAC (coûts fixes constants) ===")
console.log("Année | Variable | Fixe | Total")
console.log("------|----------|------|------")
for (let year = 0; year <= 15; year += 5) {
  const cout = calculatePacCostForYear(projet, year)
  const variable = coutVariable * Math.pow(1.03, year)
  const fixe = coutsFixes.total
  console.log(`${year.toString().padStart(2)}    | ${Math.round(variable)}€ | ${Math.round(fixe)}€ | ${Math.round(cout)}€`)
}
// Affiche:
// Année | Variable | Fixe | Total
// ------|----------|------|------
//  0    | 1050€ | 83€ | 1133€
//  5    | 1217€ | 83€ | 1300€
// 10    | 1411€ | 83€ | 1494€
// 15    | 1636€ | 83€ | 1719€
//
// Observation: Seule la partie variable évolue (+3%/an), la partie fixe reste à 83€
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
import { ProjectData } from "../types"
import { calculateCurrentAnnualCost } from "../currentCost/currentCost"
import { getDeltaAbonnementElectricite, getAbonnementElectriciteAnnuel } from "@/lib/subscriptionRates"
```

### Modules utilisés

#### types.ts
Définit l'interface `ProjectData` avec tous les champs nécessaires, incluant les nouveaux champs (Novembre 2024):
- `puissance_souscrite_actuelle`: Puissance électrique actuelle en kVA
- `puissance_souscrite_pac`: Puissance électrique pour la PAC en kVA
- `abonnement_gaz`: Abonnement gaz annuel en €/an
- `entretien_annuel`: Entretien système actuel en €/an
- `entretien_pac_annuel`: Entretien PAC en €/an
- `prix_elec_pac`: Prix électricité spécifique pour la PAC en €/kWh

#### lib/subscriptionRates.ts
**Nouveau module (Novembre 2024)**: Fournit les barèmes officiels EDF 2024 et fonctions utilitaires:
- `getDeltaAbonnementElectricite(puissanceActuelle, puissancePac)`: Calcule l'augmentation d'abonnement
- `getAbonnementElectriciteAnnuel(puissance)`: Retourne le coût d'abonnement pour une puissance donnée
- Contient les tables de tarifs Base, HP/HC, et Tempo

#### currentCost.ts
Utilisé uniquement dans les exemples de documentation, pas dans le code du module lui-même.

**Note:** Le module currentCost n'est pas importé dans pacCost.ts (sauf pour les exemples), ce qui montre une bonne séparation des responsabilités.

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

2. **Harmonisation**: Utiliser les mêmes facteurs de conversion dans tous les modules (notamment le bois: 1800 vs 2000 kWh/stère)

3. **Validation**: Ajouter des validations explicites des données d'entrée

4. **Tarification dynamique**: Intégrer les heures pleines/creuses pour un calcul plus précis du coût variable

5. ~~**Abonnement**: Ajouter le coût de l'abonnement électrique~~ ✅ **Implémenté (Novembre 2024)** - Delta abonnement électricité intégré

6. ~~**Entretien**: Intégrer le coût d'entretien annuel de la PAC** ✅ **Implémenté (Novembre 2024)** - Entretien PAC intégré dans les coûts fixes

7. ~~**Suppression abonnement gaz**: Prendre en compte l'économie sur l'abonnement gaz~~ ✅ **Implémenté (Novembre 2024)** - Économie conditionnelle intégrée

8. **Mode dégradé**: Calculer le surcoût lié à l'utilisation de la résistance électrique d'appoint lors des pics de froid

9. **Tarif électricité différencié**: Actuellement implémenté avec `prix_elec_pac`, pourrait être étendu pour gérer HP/HC automatiquement

10. **Projection inflation différenciée**: Appliquer une inflation différente aux coûts fixes (inflation générale) vs variables (inflation énergétique)
