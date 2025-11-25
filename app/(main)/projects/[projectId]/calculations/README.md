# Modules de Calcul - ThermoGain

Ce dossier contient tous les modules de calcul utilisés dans ThermoGain pour estimer les consommations énergétiques, les coûts, et les économies potentielles lors du remplacement d'un système de chauffage par une pompe à chaleur (PAC).

## 📁 Structure des Modules

Les calculs sont organisés en **5 modules spécialisés**, chacun dans son propre sous-répertoire avec une documentation détaillée :

```
calculations/
├── types.ts              # Types TypeScript partagés
├── index.ts              # Point d'entrée centralisé
├── currentCost/          # Calcul des coûts du chauffage actuel
├── pacConsumption/       # Calcul de la consommation de la PAC
├── pacCost/              # Calcul des coûts avec PAC
├── savings/              # Calcul des économies sur la durée
└── roi/                  # Calcul du ROI et financement
```

## 📖 Documentation des Modules

Chaque module dispose de sa propre documentation complète incluant :
- ✅ Description du module et de son rôle
- ✅ Liste des fonctions avec signatures TypeScript
- ✅ Formules mathématiques et logique de calcul
- ✅ Tableaux de référence et coefficients
- ✅ Raisons techniques des choix d'implémentation
- ✅ 5-6 exemples concrets avec vrais chiffres
- ✅ Dépendances et intégration

### 1. [currentCost/](./currentCost/README.md) - Coût du Chauffage Actuel

**Rôle** : Calcule le coût annuel du système de chauffage existant et estime son évolution dans le temps.

**Fonctions principales** :
- `calculateCurrentAnnualCost()` - Coût annuel actuel
- `getCurrentEnergyEvolution()` - Taux d'évolution du prix de l'énergie
- `calculateCurrentCostForYear()` - Projection du coût futur

**Ce que vous y trouverez** :
- Calcul du coût selon 8 types d'énergie (fioul, gaz, GPL, bois, pellets, électrique, PAC)
- Projection des coûts avec évolution des prix énergétiques
- Exemples : chaudière gaz 15 000 kWh/an → 1 500 €/an

### 2. [pacConsumption/](./pacConsumption/README.md) - Consommation de la PAC

**Rôle** : Calcule la consommation électrique annuelle de la future PAC en tenant compte des ajustements du COP.

**Fonctions principales** :
- `calculatePacConsumptionKwh()` - Consommation électrique de la PAC avec COP ajusté

**Ce que vous y trouverez** :
- Conversion des énergies en kWh (1L fioul = 10 kWh, 1kg GPL = 12.8 kWh, etc.)
- Ajustement du COP selon température de départ, émetteurs et climat
- Exemples : 15 000 kWh de gaz → 4 687 kWh d'électricité avec COP 3.2

### 3. [pacCost/](./pacCost/README.md) - Coût avec PAC

**Rôle** : Calcule le coût annuel du chauffage avec la PAC et ses projections futures.

**Fonctions principales** :
- `calculateCurrentConsumptionKwh()` - Conversion en équivalent kWh
- `calculatePacConsumptionKwh()` - Consommation PAC (version simple sans ajustement)
- `calculatePacAnnualCost()` - Coût annuel avec PAC
- `calculatePacCostForYear()` - Projection du coût futur

**Ce que vous y trouverez** :
- Calcul du coût électrique de la PAC
- Projection avec évolution du prix de l'électricité
- Exemples : 4 687 kWh × 0.21 €/kWh = 984 €/an

### 4. [savings/](./savings/README.md) - Économies sur la Durée

**Rôle** : Calcule les économies annuelles, projections année par année, et gains nets sur la durée de vie de la PAC.

**Fonctions principales** :
- `calculateYearlyData()` - Données année par année sur N années
- `calculateTotalSavings()` - Économies totales sur période
- `calculateNetBenefit()` - Bénéfice net (économies - investissement)
- `calculateGainsAfterROI()` - Gains nets après le ROI

**Ce que vous y trouverez** :
- Calcul des économies annuelles avec évolution des prix
- Tableau année par année (coût actuel vs PAC, économies cumulées)
- Bénéfice net sur 17 ans (durée de vie PAC)
- Exemples : 516 €/an d'économies → 8 772 € sur 17 ans

### 5. [roi/](./roi/README.md) - ROI et Financement

**Rôle** : Calcule la période de retour sur investissement et les aspects financiers (crédit, mensualités).

**Fonctions principales** :
- `calculatePaybackPeriod()` - Période de retour sur investissement en années
- `calculatePaybackYear()` - Année calendaire du ROI
- `calculateMonthlyPayment()` - Mensualité de crédit
- `calculateTotalCreditCost()` - Coût total du crédit (capital + intérêts)

**Ce que vous y trouverez** :
- Calcul du ROI avec interpolation linéaire pour précision
- Formules de crédit (mensualités, coût total)
- Exemples : Investissement 5 000 €, économies 516 €/an → ROI 9.7 ans

## 🔄 Flux de Calcul Global

```
1. Données du projet (ProjectData)
   ↓
2. [currentCost] → Coût annuel actuel (ex: 1 500 €/an)
   ↓
3. [pacConsumption] → Consommation PAC (ex: 4 687 kWh/an)
   ↓
4. [pacCost] → Coût annuel PAC (ex: 984 €/an)
   ↓
5. [savings] → Économies (ex: 516 €/an), projections 17 ans
   ↓
6. [roi] → ROI (ex: 9.7 ans), mensualités crédit
   ↓
7. Résultats (CalculationResults)
```

## 📊 Types Partagés

Le fichier [`types.ts`](./types.ts) définit les interfaces TypeScript communes :

- **`ProjectData`** - Données d'entrée du projet (consommation, prix, PAC, financement)
- **`YearlyData`** - Données annuelles (coût actuel, coût PAC, économies)
- **`CalculationResults`** - Résultats complets des calculs

## 🎯 Utilisation

```typescript
import { calculateAll } from './calculations'

const results = calculateAll(projectData)
// results.economiesAnnuelles → Économies an 1
// results.yearlyData → Tableau 17 ans
// results.paybackPeriod → ROI en années
// results.totalSavingsLifetime → Économies totales
```

## 📚 Contexte Méthodologique

### Standards et Normes Utilisés

ThermoGain s'appuie sur des sources officielles françaises et européennes :

1. **DPE 3CL-DPE 2021** (France)
   - Méthode officielle de calcul du Diagnostic de Performance Énergétique
   - Formules de rendement des chaudières selon l'âge
   - Coefficients de dégradation basés sur l'entretien

2. **ADEME** (Agence de la transition écologique)
   - COP réels mesurés : 2.9 pour PAC Air/Eau (vs 3.5-4.5 constructeur)
   - Étude 2023-2024 sur 100 foyers équipés
   - Durée de vie PAC : 17 ans

3. **API DIDO-SDES** (Ministère de la Transition Écologique)
   - Prix de l'énergie actualisés mensuellement
   - Évolutions historiques sur 10 ans pour projections
   - Source : https://data.statistiques.developpement-durable.gouv.fr/

4. **Normes européennes EN 15316**
   - Méthodologie de calcul des rendements saisonniers
   - Performance des systèmes de chauffage

### Principes Clés

1. **Rendement réel des chaudières** : Prise en compte de l'âge et de l'entretien (58-92% selon cas)
2. **COP ajusté** : Ajustement selon température départ, émetteurs, et zone climatique
3. **Zones climatiques** : 8 zones H1a à H3 (±30% de variation Nord ↔ Sud)
4. **Évolution des prix** : Projections sur 10 ans (gaz +4%/an, élec +3%/an)

### Coefficients de Conversion Énergétique

| Énergie | Conversion | Source |
|---------|------------|--------|
| Fioul | 1 L = 10 kWh | ADEME |
| Gaz | 1 kWh = 1 kWh | Compteur |
| GPL | 1 kg = 12.8 kWh | ADEME |
| Pellets | 1 kg = 4.8 kWh | ADEME |
| Bois | 1 stère = 2000 kWh | ADEME |
| Électricité | 1 kWh = 1 kWh | Direct |

## 🔗 Liens Utiles

- **Documentation générale** : Voir [README principal du projet](../../../../../../README.md)
- **Bibliothèques de calcul** : [`/lib`](../../../../../../lib)
  - `boilerEfficiency.ts` - Rendements des chaudières
  - `copAdjustments.ts` - Ajustements du COP
  - `climateZones.ts` - Zones climatiques françaises
  - `loanCalculations.ts` - Calculs de crédit
  - `energyPriceCache.ts` - Cache des prix énergétiques
  - `didoApi.ts` - API gouvernementale DIDO

## 📝 Exemples Rapides

### Exemple 1 : Chaudière gaz ancienne (20 ans)
```typescript
// Situation : 15 000 kWh gaz, 0.10 €/kWh, rendement 63% → 1 500 €/an
// PAC : COP 2.9 → 3 269 kWh élec × 0.21 €/kWh = 686 €/an
// Économies : 814 €/an (54%)
```

### Exemple 2 : Chaudière fioul ancienne (25 ans)
```typescript
// Situation : 2 500 L fioul, 1.15 €/L, rendement 54% → 2 875 €/an
// PAC : COP 2.9 → 4 647 kWh élec × 0.21 €/kWh = 976 €/an
// Économies : 1 899 €/an (66%)
```

### Exemple 3 : Chauffage électrique
```typescript
// Situation : 10 000 kWh élec, 0.21 €/kWh, rendement 100% → 2 100 €/an
// PAC : COP 2.9 → 3 448 kWh élec × 0.21 €/kWh = 724 €/an
// Économies : 1 376 €/an (66%)
```

## 🚀 Améliorations Futures

- [ ] COP dynamique selon température extérieure (courbe de performance)
- [ ] Eau chaude sanitaire dans les calculs
- [ ] Impact précis des émetteurs (radiateurs vs plancher chauffant)
- [ ] Dimensionnement automatique de la puissance PAC
- [ ] Simulation mois par mois avec températures réelles

## 📞 Support

Pour toute question technique sur les calculs :
1. Consultez le README du module concerné
2. Ouvrez une issue sur le dépôt GitHub
3. Consultez les sources officielles listées dans chaque module

---

**Dernière mise à jour** : Novembre 2024
**Version** : 1.0
**Conformité** : DPE 3CL-DPE 2021, ADEME, EN 15316
