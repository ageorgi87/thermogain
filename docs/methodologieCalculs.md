# Méthodologie de Calcul - ThermoGain

Ce document présente la méthodologie générale utilisée dans ThermoGain pour estimer les consommations énergétiques, les coûts, et les économies potentielles lors du remplacement d'un système de chauffage par une pompe à chaleur (PAC).

## Table des matières

- [Architecture des modules](#architecture-des-modules)
- [Standards et normes](#standards-et-normes)
- [Principes clés](#principes-clés)
- [Coefficients de conversion](#coefficients-de-conversion)
- [Flux de calcul global](#flux-de-calcul-global)
- [Documentation détaillée](#documentation-détaillée)

## Architecture des modules

Les calculs sont organisés en **5 modules spécialisés**, chacun ayant une responsabilité spécifique :

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

### 1. Module currentCost - Coût du Chauffage Actuel

**Rôle** : Calcule le coût annuel du système de chauffage existant et estime son évolution dans le temps.

**Nouveau (Novembre 2024)** :
- Séparation des coûts variables (énergie) et coûts fixes (abonnements, entretien)
- Utilisation du modèle Mean Reversion avec taux auto-calculés depuis l'API DIDO-SDES (18-42 ans d'historique)

**Fonctions principales** :
- `calculateCurrentVariableCost()` - Coût variable annuel (énergie uniquement)
- `calculateCurrentFixedCosts()` - Coûts fixes annuels (abonnements + entretien)
- `calculateCurrentAnnualCost()` - Coût total annuel (variable + fixe)
- `calculateCurrentCostForYear()` - Projection du coût futur avec modèle Mean Reversion

**Voir** : [Documentation détaillée des calculs de coûts](./calculs-couts.md#coûts-du-chauffage-actuel)

### 2. Module pacConsumption - Consommation de la PAC

**Rôle** : Calcule la consommation électrique annuelle de la future PAC en tenant compte des ajustements du COP.

**Fonctions principales** :
- `calculatePacConsumptionKwh()` - Consommation électrique de la PAC avec COP ajusté

**Voir** : [Documentation détaillée de la consommation PAC](./calculs-consommation.md)

### 3. Module pacCost - Coût avec PAC

**Rôle** : Calcule le coût annuel du chauffage avec la PAC et ses projections futures.

**Nouveau (Novembre 2024)** : Séparation des coûts variables (électricité) et coûts fixes (delta abonnement, suppression gaz, entretien PAC).

**Fonctions principales** :
- `calculatePacVariableCost()` - Coût variable annuel (électricité uniquement)
- `calculatePacFixedCosts()` - Coûts fixes annuels (delta abonnement + suppression gaz + entretien)
- `calculatePacAnnualCost()` - Coût total annuel (variable + fixe)
- `calculatePacCostForYear()` - Projection du coût futur

**Voir** : [Documentation détaillée des calculs de coûts](./calculs-couts.md#coûts-avec-pac)

### 4. Module savings - Économies sur la Durée

**Rôle** : Calcule les économies annuelles, projections année par année, et gains nets sur la durée de vie de la PAC.

**Fonctions principales** :
- `calculateYearlyData()` - Données année par année sur N années
- `calculateTotalSavings()` - Économies totales sur période
- `calculateNetBenefit()` - Bénéfice net (économies - investissement)
- `calculateGainsAfterROI()` - Gains nets après le ROI

**Voir** : [Documentation détaillée des économies et ROI](./calculs-economie-roi.md#calcul-des-économies)

### 5. Module roi - ROI et Financement

**Rôle** : Calcule la période de retour sur investissement et les aspects financiers (crédit, mensualités).

**Fonctions principales** :
- `calculatePaybackPeriod()` - Période de retour sur investissement en années
- `calculatePaybackYear()` - Année calendaire du ROI
- `calculateMonthlyPayment()` - Mensualité de crédit
- `calculateTotalCreditCost()` - Coût total du crédit (capital + intérêts)

**Voir** : [Documentation détaillée des économies et ROI](./calculs-economie-roi.md#calcul-du-roi)

## Standards et normes

ThermoGain s'appuie sur des sources officielles françaises et européennes :

### 1. DPE 3CL-DPE 2021 (France)
- Méthode officielle de calcul du Diagnostic de Performance Énergétique
- Formules de rendement des chaudières selon l'âge
- Coefficients de dégradation basés sur l'entretien

### 2. ADEME (Agence de la transition écologique)
- COP réels mesurés : 2.9 pour PAC Air/Eau (vs 3.5-4.5 constructeur)
- Étude 2023-2024 sur 100 foyers équipés
- Durée de vie PAC : 17 ans

### 3. API DIDO-SDES (Ministère de la Transition Écologique)
- Prix de l'énergie actualisés mensuellement
- Évolutions historiques calculées sur toutes les données disponibles (jusqu'à 42 ans)
- Pondération 70% sur les 10 dernières années, 30% sur l'historique complet
- Source : https://data.statistiques.developpement-durable.gouv.fr/

### 4. Normes européennes EN 15316
- Méthodologie de calcul des rendements saisonniers
- Performance des systèmes de chauffage

### 5. Tarifs EDF/Engie 2024
- Barème officiel des abonnements électricité et gaz
- Intégrés dans les calculs de coûts fixes

## Principes clés

### 1. Rendement réel des chaudières
Prise en compte de l'âge et de l'entretien (58-92% selon le cas) plutôt que du rendement théorique.

### 2. COP ajusté
Ajustement du COP nominal selon :
- **Température de départ** : Impact de -35% à 0% selon le type d'émetteurs
- **Type d'émetteurs** : Plancher chauffant (optimal) vs radiateurs haute température
- **Zone climatique** : 8 zones H1a à H3 avec variation de ±15%

### 3. Zones climatiques françaises
8 zones définies par la réglementation thermique RT2012 :
- **H1a, H1b, H1c** : Nord, Est, Centre (climat rigoureux) → +10 à +15% de besoin
- **H2a, H2b, H2c, H2d** : Ouest, Sud-Ouest, vallées (climat tempéré) → référence
- **H3** : Méditerranée (climat doux) → -15% de besoin

### 4. Évolution des prix de l'énergie

#### 4.1. Calcul des taux d'évolution

Projections calculées sur données historiques réelles de l'API DIDO-SDES avec modèle **Mean Reversion** (retour à la moyenne) :

| Énergie      | Historique  | Taux récent (an 1-5) | Taux équilibre (an 6+) |
|--------------|-------------|----------------------|------------------------|
| Fioul        | 42 ans      | 7.2% → 2.5%          | 2.5%/an                |
| Gaz          | 18 ans      | 8.7% → 3.5%          | 3.5%/an                |
| GPL          | 42 ans      | 7.2% → 2.5%          | 2.5%/an                |
| Bois/Pellets | 18 ans      | 3.4% → 2.0%          | 2.0%/an                |
| Électricité  | 18 ans      | 6.9% → 2.5%          | 2.5%/an                |

#### 4.2. Méthodologie de calcul du taux récent

**Étape 1 - Calcul du taux récent** (reflète les crises récentes) :
- Pondération 70% sur les 10 dernières années
- Pondération 30% sur l'historique complet
- Moyennes glissantes sur 12 mois pour lisser les variations

**Étape 2 - Calcul du taux d'équilibre** (approche académique) :
- Basé sur inflation INSEE (~2%) + croissance structurelle
- Gaz : 3.5%/an (inflation 2% + croissance demande 1.5%)
- Électricité : 2.5%/an (inflation 2% + électrification - baisse coût ENR)
- Fioul/GPL : 2.5%/an (inflation 2% + résiduel 0.5%, déclin structurel)
- Bois : 2.0%/an (inflation 2%, marché stable)

#### 4.3. Modèle de projection : Mean Reversion

Les projections sur 17 ans **n'utilisent PAS un taux constant**, mais un modèle de retour à la moyenne qui :

1. **Applique le taux récent** (influencé par les crises) les premières années
2. **Converge progressivement** vers un taux d'équilibre sur 5 ans
3. **Stabilise au taux d'équilibre** après 5 ans

Ce modèle évite de surestimer l'impact des crises récentes (Ukraine 2022) sur le long terme (17 ans).

**Exemple pour le gaz :**
- Année 1 : 8.7%/an (taux récent)
- Année 2 : 7.66%/an (transition)
- Année 3 : 6.62%/an (transition)
- Année 4 : 5.58%/an (transition)
- Année 5 : 4.54%/an (transition)
- Années 6-17 : 3.5%/an (taux d'équilibre)

**Justification :** Les crises énergétiques créent des pics temporaires qui ne reflètent pas les tendances long terme. Le modèle Mean Reversion permet une projection plus réaliste en intégrant un retour progressif vers des dynamiques structurelles.

### 5. Séparation coûts variables / coûts fixes

**Coûts VARIABLES** (évoluent avec l'inflation énergétique) :
- Consommation d'énergie (fioul, gaz, GPL, pellets, bois, électricité)
- Calculés avec les prix unitaires (€/L, €/kWh, €/kg, etc.)

**Coûts FIXES** (restent constants en euros constants) :
- Abonnements électricité et gaz
- Entretien annuel du système de chauffage
- Ces coûts suivent l'inflation générale (~2%), pas l'inflation énergétique (~7%)

**Méthodologie de projection** :
```
Coût(année n) = [Coût variable × (1 + évolution)^n] + Coûts fixes
```

**Justification** :
- Les abonnements sont des tarifs réglementés quasi-stables
- L'entretien suit l'inflation générale, pas l'inflation énergétique
- Cette approche évite de surestimer les coûts futurs

## Coefficients de conversion énergétique

**Source unique de vérité** : [`config/constants.ts`](../config/constants.ts) (section `ENERGY_CONVERSION_FACTORS`)

Tous les facteurs de conversion sont basés sur le PCI (Pouvoir Calorifique Inférieur) selon les standards ADEME.

**Exemple d'utilisation dans le code** :
```typescript
import { ENERGY_CONVERSION_FACTORS } from '@/config/constants'

const besoinsThermiques = litresFioul * ENERGY_CONVERSION_FACTORS.FIOUL_KWH_PER_LITRE
```

| Énergie      | Conversion (ordre de grandeur) | Source |
|--------------|-------------------------------|--------|
| Fioul        | ~10 kWh/L                     | PCI ADEME |
| Gaz          | 1 kWh/kWh                     | Direct |
| GPL          | ~13 kWh/kg                    | PCI ADEME |
| Pellets      | ~4.5 kWh/kg                   | PCI ADEME |
| Bois         | ~1800 kWh/stère              | PCI ADEME |
| Électricité  | 1 kWh/kWh                     | Direct |

> ⚠️ **Note** : Les valeurs ci-dessus sont des ordres de grandeur pour illustrer les calculs. Les valeurs exactes et à jour se trouvent dans `config/constants.ts`.

## Flux de calcul global

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

## Types partagés

Le fichier `types.ts` définit les interfaces TypeScript communes :

- **`ProjectData`** - Données d'entrée du projet (consommation, prix, PAC, financement)
- **`YearlyData`** - Données annuelles (coût actuel, coût PAC, économies)
- **`CalculationResults`** - Résultats complets des calculs

## Utilisation

```typescript
import { calculateAll } from './calculations'

const results = calculateAll(projectData)
// results.economiesAnnuelles → Économies an 1
// results.yearlyData → Tableau 17 ans
// results.paybackPeriod → ROI en années
// results.totalSavingsLifetime → Économies totales
```

## Exemples rapides

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

## Documentation détaillée

Pour plus de détails sur chaque module :

1. **[Calculs de coûts](./calculs-couts.md)** - Coûts du chauffage actuel et avec PAC
2. **[Calculs de consommation](./calculs-consommation.md)** - Consommation électrique de la PAC
3. **[Économies et ROI](./calculs-economie-roi.md)** - Économies, projections et retour sur investissement

## Améliorations récentes (Novembre 2024)

### 1. Refonte complète du modèle de calcul des coûts

**Objectif** : Intégrer tous les coûts fixes (abonnements, entretien) pour un calcul réaliste et complet des économies.

**Changements** :
- ✅ Séparation coûts variables vs coûts fixes
- ✅ Nouveaux champs ajoutés (puissances souscrites, abonnements, entretien)
- ✅ Barème officiel EDF 2024 intégré
- ✅ Méthodologie de projection avec évolution différenciée

**Impact** :
- Calcul complet incluant tous les coûts
- Prise en compte des économies (suppression abonnement gaz)
- Prise en compte des surcoûts (augmentation abonnement électrique, entretien PAC)
- ROI plus réaliste et précis

### 2. Amélioration du système d'évolution des prix énergétiques

**Changements** :
- ✅ Utilisation maximale des données disponibles (jusqu'à 42 ans pour le fioul)
- ✅ Pondération 70/30 sur 10 dernières années
- ✅ Calcul avec moyennes glissantes sur 12 mois
- ✅ Système de cache mensuel

**Résultats actuels** :
```
Fioul : 7.2%/an (42.8 ans de données)
Gaz : 8.7%/an (18.5 ans)
GPL : 7.2%/an (42.8 ans)
Bois : 3.4%/an (18.5 ans)
Électricité : 6.9%/an (18.5 ans)
```

### 3. Correction du calcul du ROI avec prise en compte des intérêts du crédit

La fonction `calculateAllResults()` calcule maintenant l'investissement réel selon le mode :

```typescript
// Mode Comptant
investissementReel = reste_a_charge

// Mode Crédit
investissementReel = montant_total_credit (capital + intérêts)

// Mode Mixte
investissementReel = apport_personnel + montant_total_credit (capital + intérêts)
```

**Impact** : ROI plus précis reflétant le coût réel à rembourser.

### 4. Validation du dimensionnement PAC améliorée

La fonction `validatePacPower()` du module `@/lib/copAdjustments` prend désormais en compte :

1. **Qualité d'isolation réelle** (`qualiteIsolation`: Bonne/Moyenne/Mauvaise)
2. **Zone climatique** (déduite du `code_postal`)
3. **Message de validation détaillé** mentionnant l'isolation et la zone climatique

### 5. Unification des inputs numériques du wizard

Tous les champs numériques du wizard utilisent désormais un pattern unifié :
- Pattern de field spreading : `{...field}` + override du `onChange`
- Schémas Zod : `.default(0)` pour les champs optionnels
- Comportement cohérent dans toute l'application

## Liens utiles

- **Bibliothèques de calcul** : `/lib`
  - `boilerEfficiency.ts` - Rendements des chaudières
  - `copAdjustments.ts` - Ajustements du COP
  - `climateZones.ts` - Zones climatiques françaises
  - `loanCalculations.ts` - Calculs de crédit
  - `energyPriceCache.ts` - Cache des prix énergétiques
  - `didoApi.ts` - API gouvernementale DIDO
  - `subscriptionRates.ts` - Barème EDF 2024

## Améliorations futures

- [ ] COP dynamique selon température extérieure (courbe de performance)
- [ ] Eau chaude sanitaire dans les calculs
- [ ] Impact précis des émetteurs (radiateurs vs plancher chauffant)
- [x] ~~Dimensionnement automatique de la puissance PAC~~ → **Implémenté !**
- [ ] Simulation mois par mois avec températures réelles

---

**Dernière mise à jour** : 3 décembre 2024
**Version** : 2.0
**Conformité** : DPE 3CL-DPE 2021, ADEME, EN 15316, RT2012, API DIDO-SDES, Barème EDF 2024
