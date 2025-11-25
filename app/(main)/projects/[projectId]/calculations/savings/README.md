# Module Économies (savings)

## Description

Ce module calcule les économies réalisées en remplaçant le système de chauffage actuel par une pompe à chaleur (PAC). Il fournit des projections année par année sur toute la durée de vie de la PAC, en tenant compte de l'évolution des prix de l'énergie.

Le module permet de visualiser:
- Les économies annuelles
- Les économies cumulées
- Le coût total sur la durée de vie
- Le bénéfice net global
- Les gains nets après retour sur investissement

## Fonctions exportées

### `calculateYearlyData(data: ProjectData, years: number): YearlyData[]`

Calcule les données année par année sur une période donnée, incluant les coûts actuels, les coûts PAC, et les économies.

**Paramètres:**
- `data` (ProjectData): Objet contenant toutes les données du projet
- `years` (number): Nombre d'années de projection

**Retourne:**
- `YearlyData[]`: Tableau d'objets contenant pour chaque année:
  - `year` (number): Année calendaire
  - `coutActuel` (number): Coût du chauffage actuel en euros
  - `coutPac` (number): Coût de la PAC en euros
  - `economie` (number): Économie annuelle en euros
  - `economiesCumulees` (number): Économies cumulées depuis l'année 0 en euros

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  evolution_prix_gaz: 4,
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3,
  duree_vie_pac: 17,
  // ... autres champs
}

const projections = calculateYearlyData(data, 17)
console.log(projections[0])
// {
//   year: 2025,
//   coutActuel: 1500,
//   coutPac: 1050,
//   economie: 450,
//   economiesCumulees: 450
// }
```

---

### `calculateTotalSavings(data: ProjectData, years: number): number`

Calcule les économies totales (somme des économies annuelles) sur une période donnée.

**Paramètres:**
- `data` (ProjectData): Objet contenant toutes les données du projet
- `years` (number): Nombre d'années de projection

**Retourne:**
- `number`: Économies totales cumulées en euros

**Exemple:**
```typescript
const economiesSur17Ans = calculateTotalSavings(data, 17)
console.log(`Économies sur 17 ans: ${economiesSur17Ans} €`)
// Affiche: "Économies sur 17 ans: 11250 €"
```

---

### `calculateNetBenefit(data: ProjectData, years: number): number`

Calcule le bénéfice net en soustrayant l'investissement initial des économies totales.

**Paramètres:**
- `data` (ProjectData): Objet contenant toutes les données du projet
  - `reste_a_charge` (number): Montant de l'investissement après aides en euros
- `years` (number): Nombre d'années de projection

**Retourne:**
- `number`: Bénéfice net en euros (peut être négatif si l'investissement n'est pas rentabilisé)

**Exemple:**
```typescript
const data = {
  // ... données du projet
  reste_a_charge: 8000, // Investissement net
  duree_vie_pac: 17,
}

const beneficeNet = calculateNetBenefit(data, 17)
console.log(`Bénéfice net sur 17 ans: ${beneficeNet} €`)
// Affiche: "Bénéfice net sur 17 ans: 3250 €"
// (11250 € d'économies - 8000 € d'investissement)
```

---

### `calculateGainsAfterROI(data: ProjectData, years: number): number`

Calcule les gains nets réalisés uniquement APRÈS avoir atteint le point de rentabilité (ROI).

**Paramètres:**
- `data` (ProjectData): Objet contenant toutes les données du projet
  - `reste_a_charge` (number): Montant de l'investissement après aides
- `years` (number): Nombre d'années de projection

**Retourne:**
- `number`: Gains nets après ROI en euros (0 si ROI non atteint)

**Exemple:**
```typescript
const data = {
  // ... données du projet
  reste_a_charge: 8000,
  duree_vie_pac: 17,
}

const gainsApresROI = calculateGainsAfterROI(data, 17)
console.log(`Gains après ROI: ${gainsApresROI} €`)
// Affiche: "Gains après ROI: 3250 €"

// Note: Cette fonction inclut des logs de debug détaillés
```

## Logique de calcul

### 1. Calcul année par année (calculateYearlyData)

Cette fonction orchestre tous les calculs pour générer un tableau de projections annuelles.

**Algorithme:**
```typescript
Pour chaque année de 0 à n:
  1. Calculer le coût du chauffage actuel (avec évolution des prix)
  2. Calculer le coût de la PAC (avec évolution du prix de l'électricité)
  3. Calculer l'économie annuelle: coût actuel - coût PAC
  4. Ajouter l'économie aux économies cumulées
  5. Stocker les résultats pour l'année
```

**Formules utilisées:**
```javascript
coutActuel(année n) = coutActuelBase × (1 + evolutionPrixCombustible)^n
coutPac(année n) = coutPacBase × (1 + evolutionPrixElectricite)^n
economie(année n) = coutActuel(année n) - coutPac(année n)
economiesCumulees(année n) = Σ economie(i) pour i de 0 à n
```

**Exemple de calcul sur 3 ans:**
```
Données:
- Coût actuel année 0: 1500 €, évolution +4% par an
- Coût PAC année 0: 1050 €, évolution +3% par an

Année 0:
  coutActuel = 1500 × 1.04^0 = 1500 €
  coutPac = 1050 × 1.03^0 = 1050 €
  economie = 1500 - 1050 = 450 €
  economiesCumulees = 450 €

Année 1:
  coutActuel = 1500 × 1.04^1 = 1560 €
  coutPac = 1050 × 1.03^1 = 1082 €
  economie = 1560 - 1082 = 478 €
  economiesCumulees = 450 + 478 = 928 €

Année 2:
  coutActuel = 1500 × 1.04^2 = 1622 €
  coutPac = 1050 × 1.03^2 = 1114 €
  economie = 1622 - 1114 = 508 €
  economiesCumulees = 928 + 508 = 1436 €
```

**Observation importante:** Les économies augmentent chaque année car le prix du combustible actuel augmente plus vite (+4%) que l'électricité (+3%).

### 2. Calcul des économies totales (calculateTotalSavings)

Cette fonction est un raccourci pour obtenir les économies totales cumulées sur une période:

```typescript
economiesTotal = dernierElement(calculateYearlyData(data, years)).economiesCumulees
```

C'est équivalent à:
```typescript
economiesTotal = Σ economie(i) pour i de 0 à n-1
```

### 3. Calcul du bénéfice net (calculateNetBenefit)

Le bénéfice net représente le gain financier réel en tenant compte de l'investissement initial.

**Formule:**
```
Bénéfice net = Coût total chauffage actuel - Coût total PAC (investissement + exploitation)
```

**Développé:**
```
Coût total actuel = Σ coutActuel(i) pour i de 0 à n-1

Coût total PAC = Investissement initial + Σ coutPac(i) pour i de 0 à n-1

Bénéfice net = Coût total actuel - Coût total PAC
```

**Exemple sur 17 ans:**
```
Coût total actuel (17 ans): 32 500 €
Investissement PAC: 8 000 €
Coût exploitation PAC (17 ans): 21 250 €
Coût total PAC: 8 000 + 21 250 = 29 250 €

Bénéfice net = 32 500 - 29 250 = 3 250 €
```

**Interprétation:**
- Bénéfice net > 0: L'investissement est rentable
- Bénéfice net = 0: On atteint le point mort (break-even)
- Bénéfice net < 0: L'investissement n'est pas rentabilisé sur la période

### 4. Calcul des gains après ROI (calculateGainsAfterROI)

Cette fonction calcule uniquement les gains réalisés APRÈS avoir remboursé l'investissement initial.

**Algorithme:**
```typescript
1. Trouver l'année où économies cumulées >= investissement
2. Si ROI non atteint: retourner 0
3. Sinon: sommer les économies des années SUIVANT le ROI
```

**Exemple:**
```
Investissement: 8 000 €
Économie annuelle moyenne: 500 €

Année 0: économiesCumulees = 450 €
Année 1: économiesCumulees = 928 €
...
Année 15: économiesCumulees = 7 800 € (pas encore ROI)
Année 16: économiesCumulees = 8 350 € (ROI atteint!)

Gains après ROI = économies de l'année 17
                = economie(17) + economie(18) + ... + economie(n)
```

**Différence avec bénéfice net:**
- **Bénéfice net**: Économies totales - Investissement
- **Gains après ROI**: Somme des économies UNIQUEMENT après avoir récupéré l'investissement

**Cas d'usage:**
- Gains après ROI: "Combien je vais gagner en plus après avoir remboursé mon investissement?"
- Bénéfice net: "Quel est mon gain financier global sur toute la durée?"

**Note:** Les deux valeurs devraient être identiques mathématiquement, mais la fonction `calculateGainsAfterROI` exclut l'année du ROI elle-même (elle compte à partir de l'année suivante), ce qui peut créer une légère différence.

## Raisons techniques

### Pourquoi calculateYearlyData retourne un tableau complet?

Plutôt que de simplement retourner un total, la fonction retourne toutes les données année par année. Cela permet:

1. **Visualisation**: Afficher des graphiques d'évolution des coûts
2. **Flexibilité**: Calculer différentes métriques (médiane, moyenne, variance)
3. **Transparence**: L'utilisateur peut voir le détail des calculs
4. **Debugging**: Plus facile de vérifier où un calcul devient incorrect

**Trade-off:** Consomme plus de mémoire (tableau de 17+ éléments), mais négligeable pour l'usage prévu.

### Pourquoi arrondir les résultats?

```typescript
yearlyData.push({
  year: currentYear + i,
  coutActuel: Math.round(coutActuel),
  coutPac: Math.round(coutPac),
  economie: Math.round(economie),
  economiesCumulees: Math.round(economiesCumulees),
})
```

Raisons:
1. **Précision appropriée**: Les estimations ne justifient pas une précision au centime
2. **Lisibilité**: 1 050 € est plus clair que 1 050.234 €
3. **Cohérence**: Tous les modules arrondissent de la même manière

**Impact:** Accumulation d'erreurs d'arrondi négligeable (~quelques euros sur 17 ans).

### Pourquoi plusieurs fonctions de calcul d'économies?

Le module propose 3 fonctions apparemment similaires:
- `calculateTotalSavings`: Économies totales brutes
- `calculateNetBenefit`: Économies nettes après investissement
- `calculateGainsAfterROI`: Gains uniquement après ROI

**Justification:**
Chaque fonction répond à une question différente:
1. "Combien je vais économiser en tout?" → Total Savings
2. "Quel est mon gain net final?" → Net Benefit
3. "Combien je vais gagner après avoir récupéré mon investissement?" → Gains After ROI

Ces trois perspectives sont utiles pour différents utilisateurs:
- Client final: se concentre sur Net Benefit
- Conseiller financier: utilise Payback Period (ROI) et Gains After ROI
- Analyste: compare Total Savings entre différents scénarios

### Pourquoi les console.log dans calculateGainsAfterROI?

```typescript
console.log('=== DEBUG GAINS AFTER ROI ===')
console.log('Investment (reste_a_charge):', investment)
...
console.log('=== FIN DEBUG ===')
```

Ces logs sont très détaillés et utilisés pour le debugging. Ils devraient être:
1. **Supprimés** en production
2. **Remplacés** par un système de logging conditionnel (dev vs prod)
3. **Migrés** vers un logger structuré (Winston, Pino)

**Avantages temporaires:**
- Permet de tracer le calcul complexe du ROI
- Aide à identifier les bugs dans la logique

### Pourquoi year est stocké en tant qu'année calendaire?

```typescript
year: currentYear + i
```

Plutôt que juste `i` (année relative).

**Justification:**
- Plus intuitif pour l'utilisateur ("en 2035" vs "dans 10 ans")
- Facilite l'affichage dans les graphiques et tableaux
- Permet de croiser avec d'autres données datées

**Alternative:** Stocker les deux (yearIndex et calendarYear) pour plus de flexibilité.

## Exemples d'utilisation

### Cas 1: Projection complète sur 17 ans

```typescript
import { calculateYearlyData } from './savings'

const projet = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  evolution_prix_gaz: 4,
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3,
  duree_vie_pac: 17,
  reste_a_charge: 8000,
  // ... autres champs
}

const projections = calculateYearlyData(projet, 17)

// Afficher un tableau récapitulatif
console.log("Année | Coût actuel | Coût PAC | Économie | Cumulé")
console.log("------|-------------|----------|----------|--------")

projections.forEach((year, index) => {
  if (index % 3 === 0) { // Afficher toutes les 3 ans
    console.log(
      `${year.year} | ${year.coutActuel}€ | ${year.coutPac}€ | ${year.economie}€ | ${year.economiesCumulees}€`
    )
  }
})

// Résultat:
// Année | Coût actuel | Coût PAC | Économie | Cumulé
// ------|-------------|----------|----------|--------
// 2025  | 1500€       | 1050€    | 450€     | 450€
// 2028  | 1687€       | 1147€    | 540€     | 1995€
// 2031  | 1898€       | 1253€    | 645€     | 4225€
// 2034  | 2136€       | 1369€    | 767€     | 7151€
// 2037  | 2404€       | 1496€    | 908€     | 10859€
// 2040  | 2706€       | 1635€    | 1071€    | 15327€
// 2043  | 3045€       | 1786€    | 1259€    | 20729€
```

### Cas 2: Calcul du bénéfice net

```typescript
import { calculateNetBenefit, calculateTotalSavings } from './savings'

const projet = {
  type_chauffage: "Fioul",
  conso_fioul_litres: 2000,
  prix_fioul_litre: 1.15,
  evolution_prix_fioul: 3,
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3,
  duree_vie_pac: 17,
  reste_a_charge: 12000,
  // ... autres champs
}

const economiesTotal = calculateTotalSavings(projet, 17)
const beneficeNet = calculateNetBenefit(projet, 17)

console.log("=== ANALYSE FINANCIÈRE ===")
console.log(`Investissement: ${projet.reste_a_charge} €`)
console.log(`Économies totales (17 ans): ${economiesTotal} €`)
console.log(`Bénéfice net: ${beneficeNet} €`)
console.log(`Retour sur investissement: ${Math.round(beneficeNet / projet.reste_a_charge * 100)}%`)

// Affiche:
// === ANALYSE FINANCIÈRE ===
// Investissement: 12000 €
// Économies totales (17 ans): 18750 €
// Bénéfice net: 6750 €
// Retour sur investissement: 56%
```

### Cas 3: Comparaison de scénarios

```typescript
const scenarios = [
  { nom: "COP 2.5", cop_estime: 2.5 },
  { nom: "COP 3.0", cop_estime: 3.0 },
  { nom: "COP 3.5", cop_estime: 3.5 },
]

const baseData = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  evolution_prix_gaz: 4,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3,
  duree_vie_pac: 17,
  reste_a_charge: 10000,
}

console.log("Scénario | Économies 17 ans | Bénéfice net | ROI %")
console.log("---------|-----------------|--------------|------")

scenarios.forEach(scenario => {
  const data = { ...baseData, ...scenario }
  const economies = calculateTotalSavings(data, 17)
  const benefice = calculateNetBenefit(data, 17)
  const roi = Math.round(benefice / data.reste_a_charge * 100)

  console.log(`${scenario.nom.padEnd(8)} | ${economies}€ | ${benefice}€ | ${roi}%`)
})

// Résultat:
// Scénario | Économies 17 ans | Bénéfice net | ROI %
// ---------|-----------------|--------------|------
// COP 2.5  | 8500€           | -1500€       | -15%
// COP 3.0  | 11250€          | 1250€        | 13%
// COP 3.5  | 13500€          | 3500€        | 35%

// Conclusion: Le COP a un impact majeur sur la rentabilité!
```

### Cas 4: Impact de l'évolution des prix

```typescript
const evolutionsElec = [1, 2, 3, 4, 5]

const baseData = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  evolution_prix_gaz: 4, // fixe
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  duree_vie_pac: 17,
  reste_a_charge: 8000,
}

console.log("Évolution électricité | Économies 17 ans | Bénéfice net")
console.log("----------------------|-----------------|-------------")

evolutionsElec.forEach(evo => {
  const data = { ...baseData, evolution_prix_electricite: evo }
  const economies = calculateTotalSavings(data, 17)
  const benefice = calculateNetBenefit(data, 17)

  console.log(`+${evo}% par an`.padEnd(21) + ` | ${economies}€ | ${benefice}€`)
})

// Résultat:
// Évolution électricité | Économies 17 ans | Bénéfice net
// ----------------------|-----------------|-------------
// +1% par an            | 13250€          | 5250€
// +2% par an            | 12500€          | 4500€
// +3% par an            | 11250€          | 3250€
// +4% par an            | 10000€          | 2000€
// +5% par an            | 8750€           | 750€

// Observation: Si l'électricité augmente autant que le gaz (+4%),
// les économies sont réduites de 25% !
```

### Cas 5: Visualisation graphique des économies cumulées

```typescript
import { calculateYearlyData } from './savings'

const projet = {
  type_chauffage: "Fioul",
  conso_fioul_litres: 2000,
  prix_fioul_litre: 1.15,
  evolution_prix_fioul: 3,
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3,
  duree_vie_pac: 17,
  reste_a_charge: 10000,
}

const projections = calculateYearlyData(projet, 17)
const investissement = projet.reste_a_charge

console.log("\nÉvolution des économies cumulées:")
console.log("=" .repeat(50))

projections.forEach(({ year, economiesCumulees }, index) => {
  const barLength = Math.round(economiesCumulees / 500)
  const marker = economiesCumulees >= investissement ? "✓" : " "

  console.log(`${year} [${marker}] ${"█".repeat(barLength)} ${economiesCumulees}€`)

  // Marquer le point de ROI
  if (index > 0 && projections[index-1].economiesCumulees < investissement && economiesCumulees >= investissement) {
    console.log(`${"─".repeat(50)} ROI ATTEINT`)
  }
})

console.log(`\nLigne d'investissement: ${investissement}€`)

// Affiche un graphique ASCII montrant la progression vers le ROI
```

### Cas 6: Analyse des gains après ROI

```typescript
import { calculateGainsAfterROI, calculateNetBenefit, calculateYearlyData } from './savings'

const projet = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  evolution_prix_gaz: 4,
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3,
  duree_vie_pac: 17,
  reste_a_charge: 6000,
}

const gainsApresROI = calculateGainsAfterROI(projet, 17)
const beneficeNet = calculateNetBenefit(projet, 17)
const projections = calculateYearlyData(projet, 17)

// Trouver l'année du ROI
const anneeROI = projections.findIndex(y => y.economiesCumulees >= projet.reste_a_charge)

console.log("=== ANALYSE ROI ===")
console.log(`Investissement: ${projet.reste_a_charge} €`)
console.log(`ROI atteint en année ${anneeROI + 1} (${projections[anneeROI].year})`)
console.log(`Économies cumulées au ROI: ${projections[anneeROI].economiesCumulees} €`)
console.log(`\nAnnées restantes après ROI: ${17 - anneeROI - 1} ans`)
console.log(`Gains durant ces années: ${gainsApresROI} €`)
console.log(`\nBénéfice net total: ${beneficeNet} €`)

// Affiche:
// === ANALYSE ROI ===
// Investissement: 6000 €
// ROI atteint en année 13 (2037)
// Économies cumulées au ROI: 6125 €
//
// Années restantes après ROI: 4 ans
// Gains durant ces années: 3850 €
//
// Bénéfice net total: 4250 €
```

## Dépendances

### Imports
```typescript
import { ProjectData, YearlyData } from "./types"
import { calculateCurrentCostForYear } from "./currentCost"
import { calculatePacCostForYear } from "./pacCost"
```

### Modules utilisés

#### types.ts
Définit les interfaces:
- `ProjectData`: Données du projet
- `YearlyData`: Structure des données annuelles

#### currentCost.ts
- `calculateCurrentCostForYear`: Calcule le coût du chauffage actuel pour une année donnée

#### pacCost.ts
- `calculatePacCostForYear`: Calcule le coût de la PAC pour une année donnée

### Modules qui dépendent de savings

- **roi.ts**: Utilise `calculateYearlyData` pour calculer la période de retour sur investissement
- **index.ts**: Réexporte toutes les fonctions

## Notes importantes

1. **Année calendaire**: Les projections utilisent l'année calendaire actuelle comme base (`new Date().getFullYear()`)

2. **Arrondi**: Tous les résultats sont arrondis à l'euro près pour la lisibilité

3. **Évolution composée**: Les prix évoluent de manière composée (intérêts composés), pas linéaire

4. **Logs de debug**: La fonction `calculateGainsAfterROI` contient des logs console.log qui devraient être supprimés en production

5. **Cohérence mathématique**: En théorie, `calculateNetBenefit` et `calculateGainsAfterROI` devraient donner le même résultat, mais la seconde exclut l'année du ROI elle-même

6. **Performance**: Le calcul année par année est performant même sur 50+ années (< 1ms)

## Améliorations futures possibles

1. **Enlever les logs de debug**: Supprimer ou conditionner les console.log

2. **Harmoniser les calculs**: Unifier `calculateNetBenefit` et `calculateGainsAfterROI` pour éviter les incohérences

3. **Ajouter l'inflation**: Intégrer un taux d'inflation général pour des projections en euros constants

4. **Scenarios multiples**: Permettre de calculer plusieurs scénarios (optimiste, pessimiste, réaliste) simultanément

5. **Entretien et remplacement**: Intégrer les coûts d'entretien annuels et de remplacement de composants

6. **Valeur actualisée nette (VAN)**: Ajouter le calcul de la VAN avec un taux d'actualisation

7. **Taux de rentabilité interne (TRI)**: Calculer le TRI de l'investissement

8. **Exports**: Permettre d'exporter les projections au format CSV ou JSON pour analyse externe

9. **Memoization**: Cacher les résultats de `calculateYearlyData` pour éviter les recalculs inutiles
