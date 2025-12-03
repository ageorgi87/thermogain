# Calculs de Coûts - ThermoGain

Ce document détaille les calculs de coûts pour le chauffage actuel et la pompe à chaleur (PAC), incluant la séparation coûts variables/fixes et les projections temporelles.

## Table des matières

- [Coûts du chauffage actuel](#coûts-du-chauffage-actuel)
- [Coûts avec PAC](#coûts-avec-pac)
- [Barèmes officiels](#barèmes-officiels)
- [Méthodologie de projection](#méthodologie-de-projection)

## Coûts du chauffage actuel

### Description

Ce module calcule le coût annuel TOTAL du chauffage actuel du logement, incluant:
- **Coûts variables**: Consommation énergétique (évolue avec les prix de l'énergie)
- **Coûts fixes**: Abonnements électricité/gaz + entretien annuel (constants en euros)

### Architecture du calcul

Le module est structuré en 3 niveaux:

1. **Niveau 1 - Coûts de base**: Calcul des coûts variables et fixes séparément
2. **Niveau 2 - Coût annuel total**: Agrégation des coûts variables et fixes
3. **Niveau 3 - Projections temporelles**: Application des évolutions de prix uniquement aux coûts variables

### Fonctions principales

#### `calculateCurrentVariableCost(data: ProjectData): number`

Calcule le coût VARIABLE annuel (énergie uniquement, sans abonnements ni entretien).

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
}

const coutVariable = calculateCurrentVariableCost(data)
// Résultat: 1500 € (15000 kWh × 0.10 €/kWh)
```

#### `calculateCurrentFixedCosts(data: ProjectData)`

Calcule les coûts FIXES annuels du système actuel.

**Inclut:**
1. **Abonnement électricité**: Selon puissance souscrite (barème EDF 2024)
2. **Abonnement gaz**: Uniquement si `type_chauffage === "Gaz"` (barème Engie 2024)
3. **Entretien annuel**: Coût moyen selon type de chauffage

**Retourne:**
```typescript
{
  abonnementElec: number,    // Abonnement électricité annuel (€/an)
  abonnementGaz: number,     // Abonnement gaz annuel (€/an) ou 0
  entretien: number,         // Entretien annuel (€/an)
  total: number              // Somme des coûts fixes
}
```

**Exemple - Chauffage gaz:**
```typescript
const data = {
  type_chauffage: "Gaz",
  puissance_souscrite_actuelle: 6,  // 6 kVA
  abonnement_gaz: 120,               // 120 €/an
  entretien_annuel: 120,             // 120 €/an
}

const fixedCosts = calculateCurrentFixedCosts(data)
// Résultat (exemple fictif):
// {
//   abonnementElec: 185,   // 6 kVA (barème EDF, voir constants.ts)
//   abonnementGaz: 120,    // 120 €/an
//   entretien: 120,        // 120 €/an
//   total: 425             // 185 + 120 + 120
// }
```

#### `calculateCurrentAnnualCost(data: ProjectData): number`

Calcule le coût annuel TOTAL du chauffage actuel (coûts variables + coûts fixes).

**Formule:**
```
Coût total = Coût variable + Coût fixe
           = (Consommation × Prix) + (Abonnements + Entretien)
```

#### `calculateCurrentCostForYear(data: ProjectData, year: number): number`

Calcule le coût projeté pour une année donnée avec distinction coûts variables/fixes.

**⚠️ IMPORTANT - Logique d'évolution:**
- **Coûts VARIABLES** (énergie): Évoluent selon le taux d'inflation énergétique
- **Coûts FIXES** (abonnements, entretien): Restent **constants** en euros courants

**Formule:**
```
Coût(année n) = [Coût variable base × (1 + évolution)^n] + Coûts fixes
```

### Structure des coûts énergétiques

#### Coûts VARIABLES (évolutifs)
- **Nature**: Consommation énergétique (kWh, litres, kg, stères)
- **Évolution**: Suit le prix de l'énergie (+3% à +9%/an selon l'énergie)
- **Formule**: `Consommation × Prix unitaire`

#### Coûts FIXES (constants en € courants)
- **Nature**: Frais récurrents indépendants de la consommation
- **Évolution**: Inflation générale (~2%/an) = 0% en euros constants
- **Composantes**:
  1. **Abonnement électricité** (obligatoire): 115-301 €/an selon puissance
  2. **Abonnement gaz** (si applicable): 103-267 €/an selon consommation
  3. **Entretien annuel**: 0-150 €/an selon le type

### Exemple complet

#### Chauffage au gaz (cas typique)

**Données:**
```typescript
{
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  puissance_souscrite_actuelle: 6,
  abonnement_gaz: 120,
  entretien_annuel: 120,
  evolution_prix_gaz: 8.7
}
```

**Calcul année 0 (exemple fictif):**
```
COÛTS VARIABLES:
- Consommation: 15000 kWh × 0.10 €/kWh = 1500 €/an

COÛTS FIXES:
- Abonnement élec: ~185 €/an (6 kVA, voir constants.ts)
- Abonnement gaz: 120 €/an
- Entretien: 120 €/an
- Sous-total fixes: 425 €/an

TOTAL ANNÉE 0: 1500 + 425 = 1925 €/an
```

**Projection 10 ans (exemple fictif):**
```
ANNÉE 10:
- Variables: 1500 × (1.087)^10 = 3555 €/an
- Fixes: 425 €/an (constant)
- TOTAL: 3980 €/an

CUMUL sur 10 ans: ~28 000 €
```

## Coûts avec PAC

### Description

Ce module calcule le coût annuel de fonctionnement d'une pompe à chaleur (PAC), en séparant les **coûts variables** (électricité) et les **coûts fixes** (abonnements, entretien).

**Nouveau (Novembre 2024)**: Le module intègre désormais:
- Le delta d'abonnement électricité (augmentation nécessaire pour la PAC)
- L'économie de suppression d'abonnement gaz (si applicable)
- Le coût d'entretien annuel de la PAC
- Une méthodologie de projection où seuls les coûts variables évoluent avec l'inflation énergétique

### Fonctions principales

#### `calculatePacVariableCost(data: ProjectData): number`

Calcule le coût VARIABLE annuel de la PAC (électricité uniquement).

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.0,
  prix_elec_pac: 0.21,
}

const coutVariable = calculatePacVariableCost(data)
// Résultat: 1050 € (5000 kWh × 0.21 €/kWh)
```

#### `calculatePacFixedCosts(data: ProjectData)`

Calcule les coûts FIXES annuels de la PAC.

**Retourne:**
```typescript
{
  abonnementElec: number,    // Abonnement électricité total avec PAC
  entretien: number,         // Coût entretien PAC
  total: number              // Total des coûts fixes (abonnement + entretien)
}
```

> ⚠️ **Note importante** : Cette fonction retourne le **coût total** de l'abonnement électricité avec PAC, pas le delta. Le calcul de l'économie (suppression gaz, delta électricité) est géré au niveau du module `savings`.

**Exemple (fictif):**
```typescript
const data = {
  type_chauffage: "Gaz",
  puissance_souscrite_actuelle: 6,  // 6 kVA actuel
  puissance_souscrite_pac: 9,       // 9 kVA pour PAC
  abonnement_gaz: 120,              // Abonnement gaz actuel
  entretien_pac_annuel: 150,        // Entretien PAC
}

const coutsFixes = calculatePacFixedCosts(data)
// Résultat: {
//   abonnementElec: 230,      // ~230€/an pour 9 kVA (voir constants.ts)
//   entretien: 150,           // +150€ entretien
//   total: 380                // 230 + 150 = 380€
// }
```

#### `calculatePacAnnualCost(data: ProjectData): number`

Calcule le coût annuel TOTAL de fonctionnement de la PAC (année 1).

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
}

const coutTotal = calculatePacAnnualCost(data)
// Résultat: 1133 € (1050€ variable + 83€ fixe)
```

#### `calculatePacCostForYear(data: ProjectData, year: number): number`

Calcule le coût projeté de la PAC pour une année donnée.

**IMPORTANT**: Seuls les coûts VARIABLES (électricité) évoluent avec le temps.

### Décomposition des coûts

#### 3.1. Coûts VARIABLES (électricité)

```
Coût variable PAC = Consommation PAC × Prix électricité PAC
```

#### 3.2. Coûts FIXES

##### a) Delta abonnement électricité

Augmentation de l'abonnement électrique nécessaire pour la PAC:

```
Delta abonnement = Abonnement PAC - Abonnement actuel
```

**Exemple (fictif):**
```typescript
// Puissance actuelle: 6 kVA → ~185 €/an (barème EDF, voir constants.ts)
// Puissance PAC: 9 kVA → ~230 €/an
const deltaAbonnement = 230 - 185 = 45 €/an
```

##### b) Suppression abonnement gaz (si applicable)

Si le chauffage actuel est au gaz, l'abonnement gaz peut être supprimé:

```
Économie abonnement gaz = -abonnement_gaz
```

**Important:** Cette économie est CONDITIONNELLE:
- Uniquement si `type_chauffage === "Gaz"`
- Uniquement si on supprime COMPLÈTEMENT l'abonnement gaz

##### c) Entretien PAC

**Valeurs typiques:**
- PAC Air/Eau: 120-150 €/an
- PAC Eau/Eau: 150-200 €/an
- PAC Air/Air: 80-120 €/an

#### 3.3. Coût total annuel

```
Coût total PAC = Coût variable + Coûts fixes totaux
```

Avec:
```
Coûts fixes totaux = Delta abonnement élec + Suppression abonnement gaz + Entretien
```

**Exemple complet (fictif):**
```typescript
// Coûts variables
const coutVariable = 1050 €

// Coûts fixes
const deltaAbonnement = 45 €
const suppressionGaz = -120 €  // Économie
const entretien = 150 €
const coutsFixes = 45 - 120 + 150 = 75 €

// Total
const coutTotal = 1050 + 75 = 1125 €/an
```

## Barèmes officiels

**Source unique de vérité** : [`config/constants.ts`](../config/constants.ts)

Tous les tarifs officiels (abonnements électricité/gaz, coûts d'entretien) sont centralisés et maintenus à jour dans le fichier de constantes.

**Sections du fichier constants.ts :**
- `ELECTRICITY_SUBSCRIPTION_ANNUAL` : Barème EDF (Tarif Réglementé de Vente)
- `GAS_SUBSCRIPTION` : Barème Engie (Tarif Réglementé)
- `MAINTENANCE_COSTS_ANNUAL` : Coûts d'entretien par type de chauffage

**Exemple d'utilisation dans le code :**
```typescript
import {
  ELECTRICITY_SUBSCRIPTION_ANNUAL,
  GAS_SUBSCRIPTION,
  MAINTENANCE_COSTS_ANNUAL
} from '@/config/constants'

const abonnementElec = ELECTRICITY_SUBSCRIPTION_ANNUAL[6] // 6 kVA
const abonnementGaz = GAS_SUBSCRIPTION.ANNUAL_AVERAGE
const entretien = MAINTENANCE_COSTS_ANNUAL.GAZ
```

### Abonnement électricité (ordre de grandeur)

| Puissance | Abonnement annuel | Usage type |
|-----------|-------------------|------------|
| 3 kVA     | ~140 €/an        | Très petit logement |
| 6 kVA     | ~185 €/an        | Standard sans chauffage élec |
| 9 kVA     | ~230 €/an        | Logement avec PAC/chauffage élec |
| 12 kVA    | ~280 €/an        | Grande maison avec PAC puissante |
| 15 kVA    | ~325 €/an        | Très grande maison |
| 18 kVA    | ~370 €/an        | Usage professionnel |

Prix TTC incluant: acheminement (TURPE), taxes (CSPE, CTA), TVA 5.5%

> ⚠️ **Note** : Tarifs indicatifs. Valeurs exactes dans `config/constants.ts` (source: EDF TRV)

### Abonnement gaz (ordre de grandeur)

| Tranche | Consommation | Abonnement annuel | Usage type |
|---------|--------------|-------------------|------------|
| Base    | 0-1000 kWh   | ~100 €/an        | Eau chaude uniquement |
| B0      | 1000-6000 kWh| ~120 €/an        | Eau chaude + cuisson |
| B1      | 6000-30000 kWh| ~120 €/an       | Chauffage logement |
| B2i     | 30000-300000 kWh| ~270 €/an     | Grand logement/collectif |

Prix TTC incluant: acheminement (ATRD), taxes (TICGN, CTA), TVA 5.5%

> ⚠️ **Note** : Tarifs indicatifs. Valeurs exactes dans `config/constants.ts` (source: Engie TR)

### Entretien annuel moyen

| Chauffage    | Base légale        | Ordre de grandeur |
|--------------|--------------------|-------------------|
| Gaz          | Décret n°2009-649  | ~120 €/an        |
| Fioul        | Décret n°2009-649  | ~150 €/an        |
| GPL          | Décret n°2009-649  | ~130 €/an        |
| Pellets      | Ramonage           | ~100 €/an        |
| Bois         | RSDT art. 31.6     | ~80 €/an         |
| Électricité  | -                  | 0 €/an           |
| PAC          | Décret n°2020-912  | ~120 €/an        |

> ⚠️ **Note** : Coûts indicatifs. Valeurs exactes dans `config/constants.ts` (source: ADEME, syndicats professionnels)

## Méthodologie de projection

### Principe clé

En **euros constants**, seuls les coûts variables (énergie) évoluent avec l'inflation énergétique.

```
Coût(année n) = [Coût variable × (1 + évolution)^n] + Coûts fixes
```

### Justification

| Composante | Évolution réelle | En euros constants | Prise en compte |
|------------|------------------|-------------------|-----------------|
| Prix énergie fossile | +3% à +9%/an | +1% à +7%/an | ✅ Oui |
| Prix électricité | +5% à +7%/an | +3% à +5%/an | ✅ Oui |
| Abonnements | ~+2%/an (inflation) | 0%/an | ❌ Non (constant) |
| Entretien | ~+2%/an (inflation) | 0%/an | ❌ Non (constant) |

### Exemple chiffré

```
Chauffage gaz (exemple fictif): 1500€ variable + 425€ fixes = 1925€ total
Évolution gaz: +8.7%/an

MAUVAISE MÉTHODE (tout évolue):
Année 10: 1925 × (1.087)^10 = 4562 €
Cumul 10 ans: ~31 800 €

BONNE MÉTHODE (seul variable évolue):
Année 10: (1500 × 1.087^10) + 425 = 3980 €
Cumul 10 ans: ~28 000 €

DIFFÉRENCE: ~3 800 € surestimés (12% d'erreur!)
```

### Impact sur le ROI

Cette erreur se répercute directement sur:
- Le calcul des économies
- Le ROI (retour sur investissement)
- La période de rentabilité
- La décision d'investissement du client

## Validation empirique

### Données historiques 2014-2024 (France)

| Indicateur | Évolution nominale | Évolution réelle (- IPC 2%) |
|------------|-------------------|---------------------------|
| Prix gaz naturel | +127% (8.7%/an) | +105% (6.7%/an réel) |
| Prix fioul domestique | +105% (7.2%/an) | +85% (5.2%/an réel) |
| Prix électricité | +99% (6.9%/an) | +79% (4.9%/an réel) |
| Abonnement EDF | +22% (2.0%/an) | +2% (0%/an réel ≈ constant!) |
| Tarif entretien chaudière | +20% (1.8%/an) | 0% (réel ≈ constant!) |

**Source:** DIDO-SDES, CRE, UFC Que Choisir

## Références

### Documentation officielle
- [EDF Tarif Bleu](https://particulier.edf.fr) - Barème réglementé électricité
- [Engie Tarifs Réglementés](https://particuliers.engie.fr) - Barème réglementé gaz
- [CRE - Commission de Régulation de l'Énergie](https://www.cre.fr/) - Régulation tarifs
- [ADEME - Entretien chaudières](https://www.ademe.fr/) - Coûts moyens entretien

### Textes légaux
- **Décret n°2009-649** (14 juin 2009): Entretien obligatoire chaudières gaz/fioul/GPL
- **Décret n°2020-912** (27 juillet 2020): Entretien obligatoire PAC >4kW frigorigène
- **RSDT Article 31.6**: Ramonage conduits bois

---

**Dernière mise à jour**: 3 décembre 2024
**Version**: 2.0 (ajout coûts fixes)
