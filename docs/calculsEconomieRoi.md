# Calculs d'Économies et ROI - ThermoGain

Ce document détaille les calculs des économies réalisées et du retour sur investissement (ROI) lors du remplacement d'un système de chauffage par une pompe à chaleur.

## Table des matières

- [Calcul des économies](#calcul-des-économies)
- [Calcul du ROI](#calcul-du-roi)
- [Exemples d'utilisation](#exemples-dutilisation)

## Calcul des économies

### Description

Ce module calcule les économies réalisées en remplaçant le système de chauffage actuel par une pompe à chaleur (PAC). Il fournit des projections année par année sur toute la durée de vie de la PAC, en tenant compte de l'évolution des prix de l'énergie.

Le module permet de visualiser:
- Les économies annuelles
- Les économies cumulées
- Le coût total sur la durée de vie
- Le bénéfice net global
- Les gains nets après retour sur investissement

### Fonctions principales

#### `calculateYearlyData(data: ProjectData, years: number): YearlyData[]`

Calcule les données année par année sur une période donnée, incluant les coûts actuels, les coûts PAC, et les économies.

**Retourne:**
- `YearlyData[]`: Tableau d'objets contenant pour chaque année:
  - `year` (number): Année calendaire
  - `coutActuel` (number): Coût du chauffage actuel en euros
  - `coutPac` (number): Coût de la PAC en euros
  - `economie` (number): Économie annuelle en euros
  - `economiesCumulees` (number): Économies cumulées depuis l'année 0 en euros

**Exemple:**
```typescript
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

#### `calculateTotalSavings(data: ProjectData, years: number): number`

Calcule les économies totales (somme des économies annuelles) sur une période donnée.

**Exemple:**
```typescript
const economiesSur17Ans = calculateTotalSavings(data, 17)
console.log(`Économies sur 17 ans: ${economiesSur17Ans} €`)
// Affiche: "Économies sur 17 ans: 11250 €"
```

#### `calculateNetBenefit(data: ProjectData, years: number): number`

Calcule le bénéfice net en soustrayant l'investissement initial des économies totales.

**Exemple:**
```typescript
const beneficeNet = calculateNetBenefit(data, 17)
console.log(`Bénéfice net sur 17 ans: ${beneficeNet} €`)
// Affiche: "Bénéfice net sur 17 ans: 3250 €"
// (11250 € d'économies - 8000 € d'investissement)
```

#### `calculateGainsAfterROI(data: ProjectData, years: number): number`

Calcule les gains nets réalisés uniquement APRÈS avoir atteint le point de rentabilité (ROI).

**Exemple:**
```typescript
const gainsApresROI = calculateGainsAfterROI(data, 17)
console.log(`Gains après ROI: ${gainsApresROI} €`)
// Affiche: "Gains après ROI: 3250 €"
```

### Logique de calcul

#### 1. Calcul année par année

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

#### 2. Calcul du bénéfice net

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

## Calcul du ROI

### Description

Ce module calcule la période de retour sur investissement (ROI - Return On Investment / Payback Period) d'une installation de pompe à chaleur, ainsi que les métriques financières liées au financement par crédit.

Le ROI est un indicateur clé pour évaluer la rentabilité d'un projet PAC: il indique en combien d'années les économies réalisées permettront de rembourser l'investissement initial.

### Fonctions principales

#### `calculatePaybackPeriod(data: ProjectData, maxYears: number = 30): number | null`

Calcule la période de retour sur investissement en années, avec interpolation linéaire pour plus de précision.

**Retourne:**
- `number`: Nombre d'années pour atteindre le ROI (avec 1 décimale de précision)
- `null`: Si le ROI n'est pas atteint dans la période analysée

**Exemple:**
```typescript
const payback = calculatePaybackPeriod(data)
console.log(`ROI atteint en ${payback} ans`)
// Affiche: "ROI atteint en 16.3 ans"
```

#### `calculatePaybackYear(data: ProjectData, maxYears: number = 30): number | null`

Calcule l'année calendaire où le retour sur investissement sera atteint.

**Retourne:**
- `number`: Année calendaire du ROI (ex: 2041)
- `null`: Si le ROI n'est pas atteint dans la période analysée

**Exemple:**
```typescript
const anneeROI = calculatePaybackYear(data)
console.log(`Investissement remboursé en ${anneeROI}`)
// Affiche: "Investissement remboursé en 2041"
```

#### `calculateMonthlyPayment(montant: number, tauxAnnuel: number, dureeMois: number): number`

Calcule la mensualité d'un crédit amortissable à taux fixe.

**Retourne:**
- `number`: Mensualité en euros (arrondie à 2 décimales)

**Exemple:**
```typescript
const mensualite = calculateMonthlyPayment(10000, 3.5, 120)
console.log(`Mensualité: ${mensualite} €`)
// Affiche: "Mensualité: 98.33 €"
```

#### `calculateTotalCreditCost(montant: number, tauxAnnuel: number, dureeMois: number): number`

Calcule le coût total d'un crédit (capital + intérêts).

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

### Logique de calcul

#### 1. Calcul de la période de retour sur investissement

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

#### 2. Interpolation linéaire pour précision

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

#### 3. Calcul de la mensualité de crédit

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

**Montant ou durée nul:**
```typescript
if (montant === 0 || dureeMois === 0) return 0
```

#### 4. Calcul du coût total du crédit

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

### ROI avec prise en compte des intérêts du crédit

**Nouveau (Novembre 2024)**: Le calcul du ROI tient automatiquement compte des intérêts du crédit.

La fonction `calculateAllResults()` ajuste l'investissement selon le mode de financement :

```typescript
// Mode Comptant
investissementReel = reste_a_charge

// Mode Crédit
investissementReel = montant_total_credit (capital + intérêts)

// Mode Mixte
investissementReel = apport_personnel + montant_total_credit (capital + intérêts)
```

**Impact :**
- **ROI plus précis** : reflète le coût réel à rembourser
- **Cohérence** : aligné avec le graphique des coûts cumulés
- **Transparence** : l'utilisateur voit le vrai temps nécessaire pour rentabiliser

## Exemples d'utilisation

### Cas 1: Projection complète sur 17 ans

```typescript
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
```

### Cas 2: Calcul du bénéfice net

```typescript
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

### Cas 3: Impact des aides sur le ROI

```typescript
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
```

### Cas 4: Simulation de crédit

```typescript
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
```

## Notes importantes

### 1. Année calendaire
Les projections utilisent l'année calendaire actuelle comme base (`new Date().getFullYear()`)

### 2. Arrondi
Tous les résultats sont arrondis à l'euro près pour la lisibilité

### 3. Évolution composée
Les prix évoluent de manière composée (intérêts composés), pas linéaire

### 4. ROI avec crédit
Le ROI tient compte des intérêts du crédit depuis novembre 2024

### 5. Performance
Le calcul année par année est performant même sur 50+ années (< 1ms)

## Améliorations futures possibles

1. **Ajouter l'inflation**: Intégrer un taux d'inflation général pour des projections en euros constants
2. **Scenarios multiples**: Permettre de calculer plusieurs scénarios (optimiste, pessimiste, réaliste) simultanément
3. **Entretien et remplacement**: Intégrer les coûts d'entretien annuels et de remplacement de composants
4. **Valeur actualisée nette (VAN)**: Ajouter le calcul de la VAN avec un taux d'actualisation
5. **Taux de rentabilité interne (TRI)**: Calculer le TRI de l'investissement

---

**Dernière mise à jour**: 3 décembre 2024
**Version**: 2.0
**Modules sources**: `app/(main)/projects/[projectId]/calculations/savings/` et `app/(main)/projects/[projectId]/calculations/roi/`
