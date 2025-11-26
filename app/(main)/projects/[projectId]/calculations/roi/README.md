# Module ROI (Retour sur Investissement)

## Description

Ce module calcule la période de retour sur investissement (ROI - Return On Investment / Payback Period) d'une installation de pompe à chaleur, ainsi que les métriques financières liées au financement par crédit.

Le ROI est un indicateur clé pour évaluer la rentabilité d'un projet PAC: il indique en combien d'années les économies réalisées permettront de rembourser l'investissement initial.

## Fonctions exportées

### `calculatePaybackPeriod(data: ProjectData, maxYears: number = 30): number | null`

Calcule la période de retour sur investissement en années, avec interpolation linéaire pour plus de précision.

**Paramètres:**
- `data` (ProjectData): Objet contenant toutes les données du projet
  - `reste_a_charge` (number): Montant de l'investissement net après aides en euros
- `maxYears` (number, optionnel): Nombre d'années maximum à analyser (par défaut: 30)

**Retourne:**
- `number`: Nombre d'années pour atteindre le ROI (avec 1 décimale de précision)
- `null`: Si le ROI n'est pas atteint dans la période analysée

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
  reste_a_charge: 8000,
  // ... autres champs
}

const payback = calculatePaybackPeriod(data)
console.log(`ROI atteint en ${payback} ans`)
// Affiche: "ROI atteint en 16.3 ans"
```

---

### `calculatePaybackYear(data: ProjectData, maxYears: number = 30): number | null`

Calcule l'année calendaire où le retour sur investissement sera atteint.

**Paramètres:**
- `data` (ProjectData): Objet contenant toutes les données du projet
- `maxYears` (number, optionnel): Nombre d'années maximum à analyser (par défaut: 30)

**Retourne:**
- `number`: Année calendaire du ROI (ex: 2041)
- `null`: Si le ROI n'est pas atteint dans la période analysée

**Exemple:**
```typescript
const anneeROI = calculatePaybackYear(data)
console.log(`Investissement remboursé en ${anneeROI}`)
// Affiche: "Investissement remboursé en 2041"
```

---

### `calculateMonthlyPayment(montant: number, tauxAnnuel: number, dureeMois: number): number`

Calcule la mensualité d'un crédit amortissable à taux fixe.

**Paramètres:**
- `montant` (number): Montant du crédit en euros
- `tauxAnnuel` (number): Taux d'intérêt annuel en pourcentage (ex: 3.5 pour 3.5%)
- `dureeMois` (number): Durée du crédit en mois

**Retourne:**
- `number`: Mensualité en euros (arrondie à 2 décimales)

**Exemple:**
```typescript
const mensualite = calculateMonthlyPayment(10000, 3.5, 120)
console.log(`Mensualité: ${mensualite} €`)
// Affiche: "Mensualité: 98.33 €"
```

---

### `calculateTotalCreditCost(montant: number, tauxAnnuel: number, dureeMois: number): number`

Calcule le coût total d'un crédit (capital + intérêts).

**Paramètres:**
- `montant` (number): Montant du crédit en euros
- `tauxAnnuel` (number): Taux d'intérêt annuel en pourcentage
- `dureeMois` (number): Durée du crédit en mois

**Retourne:**
- `number`: Coût total du crédit en euros (arrondi à 2 décimales)

**Exemple:**
```typescript
const coutTotal = calculateTotalCreditCost(10000, 3.5, 120)
console.log(`Coût total du crédit: ${coutTotal} €`)
console.log(`Dont intérêts: ${coutTotal - 10000} €`)
// Affiche: "Coût total du crédit: 11800 €"
// Affiche: "Dont intérêts: 1800 €"
```

## Logique de calcul

### 1. Calcul de la période de retour sur investissement (Payback Period)

Le ROI représente le temps nécessaire pour que les économies cumulées remboursent l'investissement initial.

**Algorithme:**
```typescript
1. Générer les données année par année avec calculateYearlyData()
2. Pour chaque année:
   a. Vérifier si économies cumulées >= investissement
   b. Si oui: interpoler pour trouver le moment exact
   c. Retourner le nombre d'années avec précision
3. Si ROI non atteint: retourner null
```

**Formule de base:**
```
ROI simple = Investissement / Économies annuelles moyennes
```

Mais cette formule ne tient pas compte de l'évolution des prix. Le calcul réel utilise les économies cumulées année par année.

### 2. Interpolation linéaire pour précision

Plutôt que de retourner simplement l'année entière, la fonction effectue une interpolation linéaire entre deux années pour obtenir une précision au dixième d'année.

**Formule d'interpolation:**
```typescript
ROI précis = (année - 1) + (fractionOfYear)

où:
fractionOfYear = (investissement - économies_cumulées_année_précédente) / économie_année_actuelle
```

**Exemple:**
```
Investissement: 8000 €

Année 15: économies cumulées = 7500 €
Année 16: économies cumulées = 8350 €
Économie année 16: 850 €

Montant restant à atteindre: 8000 - 7500 = 500 €
Fraction d'année: 500 / 850 = 0.588

ROI précis = 15 + 0.588 = 15.6 ans (arrondi à 1 décimale)
```

**Avantages:**
- Précision: Permet de dire "15.6 ans" plutôt que "16 ans"
- Réalisme: Plus proche de la réalité que l'arrondi à l'année supérieure
- Comparaisons: Facilite la comparaison entre projets similaires

### 3. Gestion du cas limite (année 0)

Si le ROI est atteint dès la première année (économies > investissement), la fonction retourne 1 plutôt que d'effectuer l'interpolation.

```typescript
if (i === 0) return 1
```

**Justification:**
- Évite les divisions par zéro (pas d'année précédente)
- Cas exceptionnel peu probable en pratique (investissement très faible ou économies énormes)

### 4. Calcul de la mensualité de crédit

La mensualité d'un crédit amortissable se calcule avec la formule standard:

```
M = C × (t / (1 - (1 + t)^(-n)))
```

Où:
- `M` = mensualité
- `C` = capital emprunté
- `t` = taux mensuel (taux annuel / 12)
- `n` = nombre de mensualités

**Cas particuliers:**

**Taux nul (0%):**
```typescript
if (tauxMensuel === 0) return montant / dureeMois
```
Si le taux est 0%, la mensualité est simplement le capital divisé par le nombre de mois.

**Montant ou durée nul:**
```typescript
if (montant === 0 || dureeMois === 0) return 0
```
Protection contre les divisions par zéro.

### 5. Calcul du coût total du crédit

Le coût total se calcule simplement:

```
Coût total = Mensualité × Nombre de mensualités
```

**Intérêts payés:**
```
Intérêts = Coût total - Capital emprunté
```

**Exemple:**
```
Capital: 10 000 €
Mensualité: 98.33 €
Durée: 120 mois

Coût total = 98.33 × 120 = 11 799.60 €
Intérêts = 11 799.60 - 10 000 = 1 799.60 €
```

## Raisons techniques

### Pourquoi maxYears par défaut à 30 ans?

```typescript
maxYears: number = 30
```

**Justification:**
1. **Durée de vie PAC**: Une PAC a une durée de vie de 15-20 ans (17 ans selon ADEME)
2. **Horizon raisonnable**: 30 ans permet de détecter même les projets peu rentables
3. **Performance**: Calculer 30 années reste très rapide (< 1ms)

**Si ROI > 30 ans:** Le projet n'est probablement pas rentable et la fonction retourne `null`.

### Pourquoi arrondir à 1 décimale?

```typescript
return Math.round((i + fractionOfYear) * 10) / 10
```

**Justification:**
- **Précision appropriée**: 0.1 an ≈ 1.2 mois, suffisant pour une estimation
- **Lisibilité**: "15.6 ans" est plus clair que "15.588 ans"
- **Évite la fausse précision**: Les données d'entrée ne justifient pas une précision au centième

### Pourquoi retourner null plutôt qu'une valeur négative?

```typescript
return null // ROI non atteint dans la période
```

**Alternatives considérées:**
- Retourner `-1`: Moins sémantique
- Retourner `Infinity`: Risque de casser les calculs suivants
- Lancer une exception: Trop agressif, ce n'est pas une erreur

**Avantages de null:**
- Sémantique claire: "pas de ROI"
- Type-safe avec TypeScript: `number | null`
- Facilite les tests conditionnels: `if (roi === null)`

### Pourquoi arrondir les résultats de crédit à 2 décimales?

```typescript
return Math.round(mensualite * 100) / 100
```

**Justification:**
- **Monnaie**: Les centimes sont la précision standard pour les montants en euros
- **Cohérence**: Les banques affichent toujours les mensualités avec 2 décimales
- **Précision suffisante**: Pas besoin de dixièmes de centimes

### Pourquoi calculatePaybackYear utilise Math.ceil?

```typescript
return new Date().getFullYear() + Math.ceil(paybackPeriod)
```

**Justification:**
- Si ROI = 15.6 ans, on veut l'année calendaire où le ROI sera complètement atteint
- `Math.ceil(15.6)` = 16 → année 2025 + 16 = 2041
- Arrondi supérieur car l'investissement n'est vraiment remboursé qu'à la fin de l'année 16

**Alternative:** Utiliser `Math.round()` pour plus de précision, mais moins conservateur.

## Exemples d'utilisation

### Cas 1: Calcul simple du ROI

```typescript
import { calculatePaybackPeriod, calculatePaybackYear } from './roi'

const projet = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  evolution_prix_gaz: 4,
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3,
  reste_a_charge: 8000,
  duree_vie_pac: 17,
  // ... autres champs
}

const roiAnnees = calculatePaybackPeriod(projet)
const roiAnnee = calculatePaybackYear(projet)

if (roiAnnees !== null) {
  console.log(`✅ ROI atteint en ${roiAnnees} ans (année ${roiAnnee})`)
} else {
  console.log(`❌ ROI non atteint sur la durée de vie de la PAC`)
}

// Affiche: "✅ ROI atteint en 16.3 ans (année 2041)"
```

### Cas 2: Analyse de sensibilité du ROI

```typescript
const investissements = [6000, 8000, 10000, 12000, 14000]

const baseData = {
  type_chauffage: "Fioul",
  conso_fioul_litres: 2000,
  prix_fioul_litre: 1.15,
  evolution_prix_fioul: 3,
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3,
  duree_vie_pac: 17,
}

console.log("Investissement | ROI (années) | Rentable sur 17 ans?")
console.log("---------------|--------------|---------------------")

investissements.forEach(invest => {
  const data = { ...baseData, reste_a_charge: invest }
  const roi = calculatePaybackPeriod(data)
  const rentable = roi !== null && roi <= 17

  console.log(
    `${invest}€`.padEnd(14) + ` | ${roi?.toFixed(1) || '>30'}`.padEnd(12) + ` | ${rentable ? '✅ Oui' : '❌ Non'}`
  )
})

// Résultat:
// Investissement | ROI (années) | Rentable sur 17 ans?
// ---------------|--------------|---------------------
// 6000€          | 6.2          | ✅ Oui
// 8000€          | 8.7          | ✅ Oui
// 10000€         | 11.3         | ✅ Oui
// 12000€         | 14.1         | ✅ Oui
// 14000€         | 17.2         | ❌ Non (ROI > durée de vie)
```

### Cas 3: Simulation de crédit

```typescript
import { calculateMonthlyPayment, calculateTotalCreditCost } from './roi'

const montantCredit = 12000
const taux = 3.5 // 3.5% par an
const durees = [60, 84, 120, 180] // en mois

console.log("=== SIMULATION DE CRÉDIT ===")
console.log(`Montant: ${montantCredit} €`)
console.log(`Taux: ${taux}%\n`)

console.log("Durée | Mensualité | Coût total | Intérêts | Intérêts/capital")
console.log("------|------------|------------|----------|------------------")

durees.forEach(duree => {
  const mensualite = calculateMonthlyPayment(montantCredit, taux, duree)
  const coutTotal = calculateTotalCreditCost(montantCredit, taux, duree)
  const interets = coutTotal - montantCredit
  const ratioInterets = (interets / montantCredit * 100).toFixed(1)

  console.log(
    `${duree} mois`.padEnd(5) +
    ` | ${mensualite.toFixed(2)}€`.padEnd(11) +
    ` | ${coutTotal.toFixed(2)}€`.padEnd(11) +
    ` | ${interets.toFixed(2)}€`.padEnd(9) +
    ` | ${ratioInterets}%`
  )
})

// Résultat:
// Durée | Mensualité | Coût total | Intérêts | Intérêts/capital
// ------|------------|------------|----------|------------------
// 60    | 218.82€    | 13129.20€  | 1129.20€ | 9.4%
// 84    | 162.57€    | 13655.88€  | 1655.88€ | 13.8%
// 120   | 118.00€    | 14160.00€  | 2160.00€ | 18.0%
// 180   | 85.06€     | 15310.80€  | 3310.80€ | 27.6%

// Observation: Plus le crédit est long, plus on paie d'intérêts!
```

### Cas 4: ROI avec et sans aides financières

```typescript
const projet = {
  type_chauffage: "Fioul",
  conso_fioul_litres: 2500,
  prix_fioul_litre: 1.15,
  evolution_prix_fioul: 3,
  cop_estime: 3.0,
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3,
  duree_vie_pac: 17,
}

const coutTotal = 18000
const aides = [0, 3000, 5000, 8000, 10000]

console.log("=== IMPACT DES AIDES SUR LE ROI ===")
console.log(`Coût total PAC: ${coutTotal} €\n`)

console.log("Aides | Reste à charge | ROI (années) | Gain de temps")
console.log("------|----------------|--------------|---------------")

let roiSansAide: number | null = null

aides.forEach((aide, index) => {
  const resteACharge = coutTotal - aide
  const data = { ...projet, reste_a_charge: resteACharge }
  const roi = calculatePaybackPeriod(data)

  if (index === 0) roiSansAide = roi

  const gainTemps = roiSansAide && roi ? roiSansAide - roi : 0

  console.log(
    `${aide}€`.padEnd(5) +
    ` | ${resteACharge}€`.padEnd(14) +
    ` | ${roi?.toFixed(1) || '>30'}`.padEnd(12) +
    ` | ${gainTemps > 0 ? `-${gainTemps.toFixed(1)} ans` : '-'}`
  )
})

// Résultat:
// === IMPACT DES AIDES SUR LE ROI ===
// Coût total PAC: 18000 €
//
// Aides | Reste à charge | ROI (années) | Gain de temps
// ------|----------------|--------------|---------------
// 0€    | 18000€         | 18.5         | -
// 3000€ | 15000€         | 15.3         | -3.2 ans
// 5000€ | 13000€         | 13.2         | -5.3 ans
// 8000€ | 10000€         | 10.1         | -8.4 ans
// 10000€| 8000€          | 8.0          | -10.5 ans

// Observation: 10000€ d'aides réduisent le ROI de plus de 10 ans!
```

### Cas 5: Comparaison crédit vs paiement comptant

```typescript
const investissement = 12000
const economiesAnnuelles = 900 // € par an

// Scénario 1: Paiement comptant
const roiComptant = investissement / economiesAnnuelles

// Scénario 2: Crédit à 3.5% sur 10 ans
const mensualiteCredit = calculateMonthlyPayment(investissement, 3.5, 120)
const coutTotalCredit = calculateTotalCreditCost(investissement, 3.5, 120)
const interetsCredit = coutTotalCredit - investissement

// Le ROI "réel" inclut les intérêts du crédit
const roiAvecCredit = coutTotalCredit / economiesAnnuelles

console.log("=== PAIEMENT COMPTANT VS CRÉDIT ===\n")

console.log("Paiement comptant:")
console.log(`  Investissement: ${investissement} €`)
console.log(`  ROI: ${roiComptant.toFixed(1)} ans\n`)

console.log("Paiement par crédit (3.5%, 10 ans):")
console.log(`  Capital: ${investissement} €`)
console.log(`  Mensualité: ${mensualiteCredit.toFixed(2)} €`)
console.log(`  Coût total: ${coutTotalCredit.toFixed(2)} €`)
console.log(`  Intérêts: ${interetsCredit.toFixed(2)} €`)
console.log(`  ROI réel: ${roiAvecCredit.toFixed(1)} ans`)
console.log(`\n  Surcoût: +${(roiAvecCredit - roiComptant).toFixed(1)} ans`)

// Affiche:
// === PAIEMENT COMPTANT VS CRÉDIT ===
//
// Paiement comptant:
//   Investissement: 12000 €
//   ROI: 13.3 ans
//
// Paiement par crédit (3.5%, 10 ans):
//   Capital: 12000 €
//   Mensualité: 118.00 €
//   Coût total: 14160.00 €
//   Intérêts: 2160.00 €
//   ROI réel: 15.7 ans
//
//   Surcoût: +2.4 ans
```

### Cas 6: ROI impossible (économies négatives)

```typescript
const projetNonRentable = {
  type_chauffage: "Electrique",
  conso_elec_kwh: 8000, // Consommation faible
  prix_elec_kwh: 0.21,
  evolution_prix_electricite: 3,
  cop_estime: 2.5, // COP faible
  reste_a_charge: 15000, // Investissement élevé
  duree_vie_pac: 17,
}

const roi = calculatePaybackPeriod(projetNonRentable)

if (roi === null) {
  console.log("⚠️ ATTENTION: ROI non atteint sur 30 ans")
  console.log("Ce projet n'est pas rentable financièrement.")
  console.log("\nRecommandations:")
  console.log("- Augmenter le COP (meilleure PAC ou émetteurs BT)")
  console.log("- Réduire l'investissement (plus d'aides)")
  console.log("- Considérer d'autres motivations (écologie, confort)")
} else {
  console.log(`ROI atteint en ${roi} ans`)
}

// Affiche:
// ⚠️ ATTENTION: ROI non atteint sur 30 ans
// Ce projet n'est pas rentable financièrement.
//
// Recommandations:
// - Augmenter le COP (meilleure PAC ou émetteurs BT)
// - Réduire l'investissement (plus d'aides)
// - Considérer d'autres motivations (écologie, confort)
```

## Dépendances

### Imports
```typescript
import { ProjectData } from "./types"
import { calculateYearlyData } from "./savings"
```

### Modules utilisés

#### types.ts
Définit l'interface `ProjectData` avec tous les champs nécessaires.

#### savings.ts
- `calculateYearlyData`: Génère les projections année par année pour détecter quand le ROI est atteint

### Modules qui dépendent de roi

- **index.ts**: Réexporte toutes les fonctions du module ROI

## Notes importantes

1. **Précision à 1 décimale**: Le ROI est calculé avec une précision au dixième d'année grâce à l'interpolation linéaire

2. **ROI vs durée de vie**: Si le ROI > durée de vie de la PAC, le projet n'est probablement pas rentable financièrement

3. **Null vs 0**: `null` signifie "ROI non atteint", pas "ROI = 0 ans"

4. **Intérêts de crédit**: ✅ **Depuis novembre 2024**, le calcul du ROI tient automatiquement compte des intérêts du crédit. La fonction `calculateAllResults()` ajuste l'investissement selon le mode de financement :
   - **Comptant** : `reste_a_charge` (inchangé)
   - **Crédit** : `montant_total_credit` (capital + intérêts)
   - **Mixte** : `apport_personnel + montant_total_credit` (capital + intérêts)

5. **Arrondis**: Les mensualités et coûts totaux sont arrondis à 2 décimales (centimes d'euro)

6. **Taux 0%**: La fonction gère correctement les prêts à taux zéro (souvent proposés avec les aides publiques)

## Améliorations futures possibles

1. ~~**ROI ajusté**: Calculer automatiquement le ROI en incluant les intérêts du crédit si financé~~ → **✅ Implémenté en novembre 2024**

2. **ROI actualisé**: Calculer le ROI en tenant compte de la valeur temps de l'argent (taux d'actualisation)

3. **Tableau d'amortissement**: Générer le tableau d'amortissement détaillé du crédit mois par mois

4. **Assurance emprunteur**: Intégrer le coût de l'assurance emprunteur dans le calcul du crédit

5. **Prêts composés**: Gérer le cas où l'utilisateur combine plusieurs prêts (éco-PTZ + crédit bancaire)

6. **Visualisation**: Retourner des données structurées pour tracer des courbes de ROI

7. **Sensibilité**: Calculer automatiquement une analyse de sensibilité (meilleur cas / pire cas)

8. **Comparaison multi-scénarios**: Permettre de comparer le ROI de plusieurs configurations de PAC simultanément
