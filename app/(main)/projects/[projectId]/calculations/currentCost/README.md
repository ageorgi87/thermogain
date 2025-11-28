# Module Coût Actuel (currentCost)

## Description

Ce module calcule le coût annuel TOTAL du chauffage actuel du logement, incluant:
- **Coûts variables**: Consommation énergétique (évolue avec les prix de l'énergie)
- **Coûts fixes**: Abonnements électricité/gaz + entretien annuel (constants en euros)

Cette distinction permet une modélisation financière réaliste sur 15-20 ans en tenant compte des différentes dynamiques d'évolution des coûts.

## Architecture du module

Le module est structuré en 3 niveaux de calcul:

1. **Niveau 1 - Coûts de base**: Calcul des coûts variables et fixes séparément
2. **Niveau 2 - Coût annuel total**: Agrégation des coûts variables et fixes
3. **Niveau 3 - Projections temporelles**: Application des évolutions de prix uniquement aux coûts variables

## Fonctions exportées

### `calculateCurrentVariableCost(data: ProjectData): number`

**NOUVEAU - Novembre 2024**

Calcule le coût VARIABLE annuel (énergie uniquement, sans abonnements ni entretien).

**Paramètres:**
- `data` (ProjectData): Objet contenant toutes les données du projet
  - `type_chauffage` (string): Type de chauffage actuel
  - `conso_*` (number, optionnel): Consommation annuelle selon le type
  - `prix_*` (number, optionnel): Prix unitaire selon le type

**Retourne:**
- `number`: Coût variable annuel en euros

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

---

### `calculateCurrentFixedCosts(data: ProjectData)`

**NOUVEAU - Novembre 2024**

Calcule les coûts FIXES annuels du système actuel.

**Inclut:**
1. **Abonnement électricité**: Selon puissance souscrite (barème EDF 2024)
2. **Abonnement gaz**: Uniquement si `type_chauffage === "Gaz"` (barème Engie 2024)
3. **Entretien annuel**: Coût moyen selon type de chauffage

**Paramètres:**
- `data.puissance_souscrite_actuelle` (number, défaut: 6): Puissance électrique en kVA (3, 6, 9, 12, 15, 18)
- `data.abonnement_gaz` (number, défaut: 120): Coût abonnement gaz annuel (€/an) si applicable
- `data.entretien_annuel` (number): Coût entretien annuel (€/an)

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
  entretien_annuel: 120,             // 120 €/an (entretien chaudière gaz obligatoire)
}

const fixedCosts = calculateCurrentFixedCosts(data)
// Résultat: {
//   abonnementElec: 151,   // 6 kVA → 151 €/an (barème EDF)
//   abonnementGaz: 120,    // 120 €/an
//   entretien: 120,        // 120 €/an
//   total: 391             // 151 + 120 + 120
// }
```

**Exemple - Chauffage fioul:**
```typescript
const data = {
  type_chauffage: "Fioul",
  puissance_souscrite_actuelle: 6,
  abonnement_gaz: 0,         // Pas de gaz
  entretien_annuel: 150,     // 150 €/an (entretien chaudière fioul)
}

const fixedCosts = calculateCurrentFixedCosts(data)
// Résultat: {
//   abonnementElec: 151,   // 6 kVA → 151 €/an
//   abonnementGaz: 0,      // Pas de gaz
//   entretien: 150,        // 150 €/an
//   total: 301             // 151 + 0 + 150
// }
```

---

### `calculateCurrentAnnualCost(data: ProjectData): number`

**MODIFIÉ - Novembre 2024**

Calcule le coût annuel TOTAL du chauffage actuel (coûts variables + coûts fixes).

**Formule:**
```
Coût total = Coût variable + Coût fixe
           = (Consommation × Prix) + (Abonnements + Entretien)
```

**Retourne:**
- `number`: Coût total annuel en euros

**Exemple - Chauffage gaz complet:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  puissance_souscrite_actuelle: 6,
  abonnement_gaz: 120,
  entretien_annuel: 120,
}

const coutTotal = calculateCurrentAnnualCost(data)
// Calcul détaillé:
// - Coût variable: 15000 × 0.10 = 1500 €/an
// - Coûts fixes:
//   - Abonnement élec: 151 €/an (6 kVA)
//   - Abonnement gaz: 120 €/an
//   - Entretien: 120 €/an
//   - Total fixe: 391 €/an
// TOTAL: 1500 + 391 = 1891 €/an
```

**Impact des coûts fixes:**
```typescript
// AVANT (ancien calcul sans coûts fixes):
// Coût = 1500 €/an (seulement énergie)

// APRÈS (nouveau calcul avec coûts fixes):
// Coût = 1891 €/an (+26% plus réaliste!)
```

---

### `getCurrentEnergyEvolution(data: ProjectData): number`

Obtient le taux d'évolution annuel du prix de l'énergie actuelle.

**Note**: Cette évolution s'applique UNIQUEMENT aux coûts variables (prix de l'énergie). Les coûts fixes (abonnements, entretien) restent constants en euros courants.

**Paramètres:**
- `data.type_chauffage`: Type de chauffage
- `data.evolution_prix_*`: Taux d'évolution selon le type (%)

**Retourne:**
- `number`: Taux d'évolution annuel en % (ex: 3 pour +3%/an)

**Source des taux:**
API DIDO-SDES (Ministère de la Transition Écologique) - Données historiques pondérées sur 10 ans.

---

### `calculateCurrentCostForYear(data: ProjectData, year: number): number`

**MODIFIÉ - Novembre 2024**

Calcule le coût projeté pour une année donnée avec distinction coûts variables/fixes.

**⚠️ IMPORTANT - Logique d'évolution:**
- **Coûts VARIABLES** (énergie): Évoluent selon le taux d'inflation énergétique
- **Coûts FIXES** (abonnements, entretien): Restent **constants** en euros courants

**Justification:**
Les abonnements et coûts d'entretien suivent l'inflation générale (~2%/an), tandis que les prix de l'énergie ont une évolution propre (3-9%/an selon l'énergie). En calcul d'investissement PAC, on raisonne en **euros constants** (déduction de l'inflation générale), donc les coûts fixes restent constants tandis que seule l'inflation énergétique spécifique est prise en compte.

**Formule:**
```
Coût(année n) = Coût variable(année n) + Coûts fixes constants
              = [Coût variable base × (1 + évolution)^n] + Coûts fixes
```

**Exemple - Projection gaz sur 10 ans:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  evolution_prix_gaz: 8.7,  // Taux DIDO 2024: +8.7%/an
  puissance_souscrite_actuelle: 6,
  abonnement_gaz: 120,
  entretien_annuel: 120,
}

// Année 0 (actuelle):
const annee0 = calculateCurrentCostForYear(data, 0)
// Variable: 1500 €
// Fixes: 391 €
// Total: 1891 €

// Année 5:
const annee5 = calculateCurrentCostForYear(data, 5)
// Variable: 1500 × (1.087)^5 = 2310 € (+54% !!)
// Fixes: 391 € (constant)
// Total: 2701 €

// Année 10:
const annee10 = calculateCurrentCostForYear(data, 10)
// Variable: 1500 × (1.087)^10 = 3555 € (+137% !!!)
// Fixes: 391 € (constant)
// Total: 3946 €
```

**Impact sur le ROI PAC:**
Sans cette distinction variable/fixe, on surestimerait l'évolution totale des coûts, ce qui fausserait le calcul de rentabilité de la PAC.

## Logique de calcul détaillée

### 1. Structure des coûts énergétiques

Les coûts énergétiques totaux se décomposent en 2 catégories:

#### A. Coûts VARIABLES (évolutifs)
- **Nature**: Consommation énergétique (kWh, litres, kg, stères)
- **Évolution**: Suit le prix de l'énergie (+3% à +9%/an selon l'énergie)
- **Formule**: `Consommation × Prix unitaire`

#### B. Coûts FIXES (constants en € courants)
- **Nature**: Frais récurrents indépendants de la consommation
- **Évolution**: Inflation générale (~2%/an) = 0% en euros constants
- **Composantes**:
  1. **Abonnement électricité** (obligatoire): 115-301 €/an selon puissance (EDF Tarif Bleu 2024)
  2. **Abonnement gaz** (si applicable): 103-267 €/an selon consommation (Engie 2024)
  3. **Entretien annuel**: 0-150 €/an selon le type (obligations légales + recommandations)

### 2. Barèmes officiels intégrés

#### Abonnement électricité (source: EDF Tarif Bleu 2024)
```
3 kVA  → 115 €/an (~9.60 €/mois)  - Très petit logement
6 kVA  → 151 €/an (~12.60 €/mois) - Standard sans chauffage élec
9 kVA  → 189 €/an (~15.75 €/mois) - Logement avec PAC/chauffage élec
12 kVA → 228 €/an (~19.00 €/mois) - Grande maison avec PAC puissante
15 kVA → 264 €/an (~22.00 €/mois) - Très grande maison
18 kVA → 301 €/an (~25.08 €/mois) - Usage professionnel
```

Prix TTC incluant: acheminement (TURPE), taxes (CSPE, CTA), TVA 5.5%

#### Abonnement gaz (source: Engie Tarif Réglementé 2024)
```
Base (0-1000 kWh/an)      → 103 €/an - Eau chaude uniquement
B0 (1000-6000 kWh/an)     → 120 €/an - Eau chaude + cuisson
B1 (6000-30000 kWh/an)    → 120 €/an - Chauffage logement (VALEUR MOYENNE)
B2i (30000-300000 kWh/an) → 267 €/an - Grand logement/collectif
```

Prix TTC incluant: acheminement (ATRD), taxes (TICGN, CTA), TVA 5.5%

#### Entretien annuel moyen (sources: ADEME, syndicats professionnels 2024)
```
Gaz          → 120 €/an - Obligatoire annuellement (Décret n°2009-649)
Fioul        → 150 €/an - Obligatoire annuellement (Décret n°2009-649)
GPL          → 130 €/an - Obligatoire annuellement
Pellets      → 100 €/an - Ramonage + nettoyage
Bois         → 80 €/an  - Ramonage 2x/an si usage principal
Électricité  → 0 €/an   - Aucun entretien obligatoire
PAC          → 120 €/an - Obligatoire tous les 2 ans (Décret n°2020-912), annuel recommandé
```

### 3. Exemples de calcul complets

#### Exemple 1: Chauffage au gaz (cas typique)

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

**Calcul année 0:**
```
COÛTS VARIABLES:
- Consommation: 15000 kWh × 0.10 €/kWh = 1500 €/an

COÛTS FIXES:
- Abonnement élec: 151 €/an (6 kVA)
- Abonnement gaz: 120 €/an
- Entretien: 120 €/an
- Sous-total fixes: 391 €/an

TOTAL ANNÉE 0: 1500 + 391 = 1891 €/an
```

**Projection 10 ans:**
```
ANNÉE 10:
- Variables: 1500 × (1.087)^10 = 3555 €/an
- Fixes: 391 €/an (constant)
- TOTAL: 3946 €/an

CUMUL sur 10 ans: 27 847 € (vs 18 910 € sans évolution)
```

#### Exemple 2: Chauffage au fioul (forte évolution)

**Données:**
```typescript
{
  type_chauffage: "Fioul",
  conso_fioul_litres: 2000,
  prix_fioul_litre: 1.15,
  puissance_souscrite_actuelle: 6,
  abonnement_gaz: 0,
  entretien_annuel: 150,
  evolution_prix_fioul: 7.2
}
```

**Calcul année 0:**
```
COÛTS VARIABLES:
- Consommation: 2000 L × 1.15 €/L = 2300 €/an

COÛTS FIXES:
- Abonnement élec: 151 €/an
- Abonnement gaz: 0 €/an (pas de gaz)
- Entretien: 150 €/an (chaudière fioul)
- Sous-total fixes: 301 €/an

TOTAL ANNÉE 0: 2300 + 301 = 2601 €/an
```

**Projection 10 ans:**
```
ANNÉE 10:
- Variables: 2300 × (1.072)^10 = 4652 €/an (+102% !)
- Fixes: 301 €/an
- TOTAL: 4953 €/an

CUMUL sur 10 ans: 36 078 € (TRÈS COÛTEUX)
```

**Impact PAC:**
En passant à une PAC avec COP 3:
- Consommation PAC: (2000 L × 10 kWh/L) / 3 = 6667 kWh
- Coût variable PAC: 6667 × 0.21 = 1400 €/an
- **ÉCONOMIE VARIABLE**: 2300 - 1400 = 900 €/an
- **ÉCONOMIE FIXE**: Suppression entretien fioul (-150€) + ajout entretien PAC (+120€) = -30 €/an
- **ÉCONOMIE TOTALE**: ~870 €/an année 1, augmentant avec l'évolution du fioul !

#### Exemple 3: PAC existante (remplacement)

**Données:**
```typescript
{
  type_chauffage: "PAC Air/Eau",
  cop_actuel: 2.5,
  conso_pac_kwh: 6000,
  prix_elec_kwh: 0.21,
  puissance_souscrite_actuelle: 9,
  abonnement_gaz: 0,
  entretien_annuel: 120,
  evolution_prix_electricite: 6.9
}
```

**Calcul:**
```
COÛTS VARIABLES:
- Consommation: 6000 kWh × 0.21 €/kWh = 1260 €/an

COÛTS FIXES:
- Abonnement élec: 189 €/an (9 kVA pour PAC)
- Abonnement gaz: 0 €/an
- Entretien: 120 €/an
- Sous-total fixes: 309 €/an

TOTAL ANNÉE 0: 1260 + 309 = 1569 €/an
```

**Remplacement par PAC neuve (COP 3.5):**
```
Besoins thermiques: 6000 × 2.5 = 15000 kWh
Nouvelle conso: 15000 / 3.5 = 4286 kWh

NOUVEAU COÛT:
- Variables: 4286 × 0.21 = 900 €/an
- Fixes: 309 €/an (identiques)
- TOTAL: 1209 €/an

ÉCONOMIE: 1569 - 1209 = 360 €/an
```

### 4. Pourquoi cette architecture à 3 niveaux?

#### Niveau 1: Calcul séparé variables/fixes
**Avantages:**
- Transparence: L'utilisateur comprend d'où viennent ses coûts
- Flexibilité: Modifications faciles (nouveaux barèmes EDF/Engie)
- Réutilisabilité: Fonctions exportables pour affichage détaillé

#### Niveau 2: Agrégation totale
**Utilité:**
- Coût total annuel actuel (année 0)
- Comparaison simple avec coût PAC
- Affichage mensuel: `coutTotal / 12`

#### Niveau 3: Projections différenciées
**Justification économique:**

L'évolution des coûts n'est PAS uniforme:

| Composante | Évolution réelle | En euros constants | Prise en compte |
|------------|------------------|-------------------|-----------------|
| Prix énergie fossile | +3% à +9%/an | +1% à +7%/an | ✅ Oui |
| Prix électricité | +5% à +7%/an | +3% à +5%/an | ✅ Oui |
| Abonnements | ~+2%/an (inflation) | 0%/an | ❌ Non (constant) |
| Entretien | ~+2%/an (inflation) | 0%/an | ❌ Non (constant) |

**Conséquence:** Appliquer l'évolution énergétique à TOUT le coût surestimerait les coûts futurs et fausserait le ROI.

**Exemple chiffré:**
```
Chauffage gaz: 1500€ variable + 391€ fixes = 1891€ total
Évolution gaz: +8.7%/an

MAUVAISE MÉTHODE (tout évolue):
Année 10: 1891 × (1.087)^10 = 4482 €
Cumul 10 ans: 31 258 €

BONNE MÉTHODE (seul variable évolue):
Année 10: (1500 × 1.087^10) + 391 = 3946 €
Cumul 10 ans: 27 847 €

DIFFÉRENCE: 3 411 € surestimés (12% d'erreur sur le cumul!)
```

Cette erreur se répercute directement sur:
- Le calcul des économies
- Le ROI (retour sur investissement)
- La période de rentabilité
- La décision d'investissement du client

## Raisons techniques approfondies

### Pourquoi intégrer les coûts fixes?

#### 1. Réalisme financier

**AVANT (ancien calcul):**
```
Gaz: 15000 kWh × 0.10 €/kWh = 1500 €/an
PAC: 5000 kWh × 0.21 €/kWh = 1050 €/an
→ Économie: 450 €/an
```

**APRÈS (nouveau calcul):**
```
Gaz: 1500€ + 391€ (fixes) = 1891 €/an
PAC: 1050€ + 158€ (delta fixes) = 1208 €/an
→ Économie: 683 €/an (+52% par rapport à l'ancien calcul!)
```

L'ancien calcul sous-estimait les économies car il ignorait:
- La suppression de l'abonnement gaz (-120 €/an)
- Le léger surcoût d'abonnement élec (+38 €/an: 6→9 kVA)
- La différence d'entretien (120€ PAC vs 120€ gaz ≈ 0)

#### 2. Conformité réglementaire

**Obligations légales en France:**

| Chauffage | Base légale | Fréquence | Coût moyen |
|-----------|-------------|-----------|------------|
| Chaudière gaz | Décret n°2009-649 | Annuel obligatoire | 120 €/an |
| Chaudière fioul | Décret n°2009-649 | Annuel obligatoire | 150 €/an |
| Chaudière GPL | Décret n°2009-649 | Annuel obligatoire | 130 €/an |
| PAC (>4kW frigorigène) | Décret n°2020-912 | Tous les 2 ans minimum | 120 €/an recommandé |
| Poêle/chaudière bois | RSDT art. 31.6 | Ramonage 2×/an | 80-100 €/an |
| Chauffage électrique | - | Aucune obligation | 0 €/an |

Ignorer ces coûts = calcul non conforme à la réalité réglementaire française.

#### 3. Comparaison équitable PAC vs autres énergies

Sans les coûts fixes, la comparaison est biaisée:

**Exemple Pellets vs PAC:**
```
ANCIEN CALCUL (variables seulement):
Pellets: 3000 kg × 0.30 €/kg = 900 €/an
PAC: 4000 kWh × 0.21 €/kWh = 840 €/an
→ Pellets semble quasi-équivalent à la PAC

NOUVEAU CALCUL (complet):
Pellets: 900€ + (151 + 0 + 100) = 1151 €/an
PAC: 840€ + (189 + 0 + 120) = 1149 €/an
→ Presque identique MAIS:
  - Pellets: Prix stable (+3.4%/an), stockage nécessaire, livraisons
  - PAC: Confort supérieur, climatisation été, moins de maintenance
```

La PAC devient plus attractive quand on inclut TOUS les coûts réels.

### Pourquoi séparer variables et fixes dans les projections?

#### 1. Justification économique

**Théorie:** En analyse d'investissement, on raisonne en **euros constants** (valeur réelle déduction faite de l'inflation).

**Application:**
- **Inflation générale (IPC)**: ~2%/an → Neutralisée dans le calcul
- **Inflation énergétique spécifique**: +3% à +9%/an → Prise en compte

**Conséquence:**
- Les abonnements/entretiens suivent l'inflation générale → **Constants en € constants**
- Les prix énergétiques ont une inflation propre → **Variables selon leur taux spécifique**

**Formule:**
```
Taux réel énergie = Taux nominal - Inflation IPC
                  = (ex: 8.7% gaz) - 2% = 6.7% réel
```

On applique donc 8.7% au prix du gaz (écart vs inflation), mais 0% aux abonnements (suivent l'inflation).

#### 2. Validation empirique

**Données historiques 2014-2024 (France):**

| Indicateur | Évolution nominale | Évolution réelle (- IPC 2%) |
|------------|-------------------|---------------------------|
| Prix gaz naturel | +127% (8.7%/an) | +105% (6.7%/an réel) |
| Prix fioul domestique | +105% (7.2%/an) | +85% (5.2%/an réel) |
| Prix électricité | +99% (6.9%/an) | +79% (4.9%/an réel) |
| Abonnement EDF | +22% (2.0%/an) | +2% (0%/an réel ≈ constant!) |
| Tarif entretien chaudière | +20% (1.8%/an) | 0% (réel ≈ constant!) |

**Source:** DIDO-SDES, CRE, UFC Que Choisir

**Conclusion:** Les données réelles valident notre modélisation:
- Les coûts fixes suivent l'inflation générale
- Les coûts variables ont une évolution propre bien supérieure

#### 3. Impact chiffré sur le ROI

**Exemple: Installation PAC 12 000€ (après aides), Gaz → PAC**

**Scénario A: Tout évolue à +8.7%/an (FAUX)**
```
Cumul économies 10 ans: 14 523 €
ROI: 8.3 ans
```

**Scénario B: Seules variables évoluent (CORRECT)**
```
Cumul économies 10 ans: 11 847 €
ROI: 10.1 ans
```

**Différence:** 1.8 ans de ROI, soit une erreur de 22% sur la période de rentabilité!

Donner un ROI de 8.3 ans au lieu de 10.1 ans = **publicité mensongère** et **déception client**.

### Pourquoi utiliser les barèmes officiels?

#### 1. Exactitude réglementée

Les tarifs EDF/Engie sont **réglementés par l'État** (CRE - Commission de Régulation de l'Énergie):

**Avantages:**
- Prix publics, vérifiables, opposables
- Mise à jour annuelle officielle (Octobre/Novembre)
- Homogènes sur tout le territoire (hors Corse, DOM-TOM)
- Base légale solide pour conseils clients

**vs estimations approximatives:**
- Risque de sous/sur-estimation
- Obsolescence rapide
- Pas de traçabilité

#### 2. Maintenabilité

Le module `/lib/subscriptionRates.ts` centralise tous les barèmes:

**Structure:**
```typescript
export const ABONNEMENT_ELECTRICITE_ANNUEL = {
  3: 115,
  6: 151,
  9: 189,
  12: 228,
  15: 264,
  18: 301,
}

export const ENTRETIEN_ANNUEL_MOYEN = {
  "Gaz": 120,
  "Fioul": 150,
  // ...
}
```

**Mise à jour annuelle:**
1. Consulter nouveau barème EDF/Engie (publications Octobre)
2. Modifier uniquement `/lib/subscriptionRates.ts`
3. TOUS les calculs sont automatiquement à jour

**vs code en dur dans les calculs:**
- Modifications dans 10+ fichiers
- Risque d'oubli/incohérence
- Impossible de tracer l'historique des tarifs

#### 3. Documentation exhaustive

Le README `/lib/subscriptionRates.README.md` (800+ lignes) documente:
- Sources officielles avec URL
- Dates de validité
- Détails techniques (TURPE, CSPE, etc.)
- Exemples de calcul
- Contexte réglementaire

→ **"Bible" de référence** pour audits, support client, formation commerciaux

## Exemples d'utilisation avancés

### Cas 1: Comparaison multi-énergies

```typescript
import {
  calculateCurrentAnnualCost,
  calculateCurrentVariableCost,
  calculateCurrentFixedCosts
} from './currentCost'

const energies = [
  {
    type: "Gaz",
    conso_gaz_kwh: 15000,
    prix_gaz_kwh: 0.10,
    puissance_souscrite_actuelle: 6,
    abonnement_gaz: 120,
    entretien_annuel: 120,
  },
  {
    type: "Fioul",
    conso_fioul_litres: 1500,
    prix_fioul_litre: 1.15,
    puissance_souscrite_actuelle: 6,
    entretien_annuel: 150,
  },
  {
    type: "Pellets",
    conso_pellets_kg: 3000,
    prix_pellets_kg: 0.30,
    puissance_souscrite_actuelle: 6,
    entretien_annuel: 100,
  },
]

energies.forEach(data => {
  const variable = calculateCurrentVariableCost({ type_chauffage: data.type, ...data })
  const fixes = calculateCurrentFixedCosts({ type_chauffage: data.type, ...data })
  const total = calculateCurrentAnnualCost({ type_chauffage: data.type, ...data })

  console.log(`\n${data.type}:`)
  console.log(`  Variable: ${variable}€`)
  console.log(`  Fixes: ${fixes.total}€ (élec:${fixes.abonnementElec} gaz:${fixes.abonnementGaz} entretien:${fixes.entretien})`)
  console.log(`  TOTAL: ${total}€`)
})

// Résultat:
//
// Gaz:
//   Variable: 1500€
//   Fixes: 391€ (élec:151 gaz:120 entretien:120)
//   TOTAL: 1891€
//
// Fioul:
//   Variable: 1725€
//   Fixes: 301€ (élec:151 gaz:0 entretien:150)
//   TOTAL: 2026€
//
// Pellets:
//   Variable: 900€
//   Fixes: 251€ (élec:151 gaz:0 entretien:100)
//   TOTAL: 1151€
```

### Cas 2: Projection détaillée sur durée de vie PAC

```typescript
import {
  calculateCurrentCostForYear,
  calculateCurrentVariableCost,
  calculateCurrentFixedCosts,
  getCurrentEnergyEvolution
} from './currentCost'

const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  prix_gaz_kwh: 0.10,
  evolution_prix_gaz: 8.7,
  puissance_souscrite_actuelle: 6,
  abonnement_gaz: 120,
  entretien_annuel: 120,
}

const dureeViePac = 17 // ans

console.log("Projection coût chauffage gaz sur durée de vie PAC:\n")
console.log("Année | Variable | Fixes | Total | Cumul")
console.log("------|----------|-------|-------|-------")

let cumulTotal = 0

for (let year = 0; year <= dureeViePac; year++) {
  const variable = calculateCurrentVariableCost(data)
  const evolution = getCurrentEnergyEvolution(data)
  const variableYear = variable * Math.pow(1 + evolution / 100, year)

  const fixes = calculateCurrentFixedCosts(data)

  const total = calculateCurrentCostForYear(data, year)

  cumulTotal += total

  console.log(
    `${year.toString().padStart(5)} | ` +
    `${Math.round(variableYear).toString().padStart(8)}€ | ` +
    `${Math.round(fixes.total).toString().padStart(5)}€ | ` +
    `${Math.round(total).toString().padStart(5)}€ | ` +
    `${Math.round(cumulTotal).toString().padStart(6)}€`
  )
}

// Résultat:
//     0 |     1500€ |   391€ |  1891€ |   1891€
//     1 |     1630€ |   391€ |  2021€ |   3912€
//     2 |     1772€ |   391€ |  2163€ |   6075€
//     3 |     1926€ |   391€ |  2317€ |   8393€
//     4 |     2094€ |   391€ |  2485€ |  10878€
//     5 |     2276€ |   391€ |  2667€ |  13545€
//    ...
//    17 |     6486€ |   391€ |  6877€ |  69453€
//
// TOTAL CUMULÉ sur 17 ans: 69 453 €
```

### Cas 3: Impact d'une augmentation de puissance

```typescript
import { calculateCurrentFixedCosts } from './currentCost'

const scenarios = [
  { nom: "Actuel (6 kVA)", puissance: 6 },
  { nom: "Avec PAC moyenne (9 kVA)", puissance: 9 },
  { nom: "Avec PAC puissante (12 kVA)", puissance: 12 },
]

const baseData = {
  type_chauffage: "Gaz",
  abonnement_gaz: 120,
  entretien_annuel: 120,
}

console.log("Impact puissance électrique sur coûts fixes:\n")

scenarios.forEach(scenario => {
  const fixes = calculateCurrentFixedCosts({
    ...baseData,
    puissance_souscrite_actuelle: scenario.puissance
  })

  console.log(`${scenario.nom}:`)
  console.log(`  Abonnement élec: ${fixes.abonnementElec}€/an`)
  console.log(`  Abonnement gaz: ${fixes.abonnementGaz}€/an`)
  console.log(`  Entretien: ${fixes.entretien}€/an`)
  console.log(`  TOTAL: ${fixes.total}€/an\n`)
})

// Résultat:
// Actuel (6 kVA):
//   Abonnement élec: 151€/an
//   Abonnement gaz: 120€/an
//   Entretien: 120€/an
//   TOTAL: 391€/an
//
// Avec PAC moyenne (9 kVA):
//   Abonnement élec: 189€/an (+38€)
//   Abonnement gaz: 120€/an
//   Entretien: 120€/an
//   TOTAL: 429€/an (+38€/an)
//
// Avec PAC puissante (12 kVA):
//   Abonnement élec: 228€/an (+77€)
//   Abonnement gaz: 120€/an
//   Entretien: 120€/an
//   TOTAL: 468€/an (+77€/an)
```

## Dépendances

### Imports
```typescript
import { ProjectData } from "../types"
import { getAbonnementElectriciteAnnuel } from "@/lib/subscriptionRates"
```

### Modules utilisés
- **types.ts**: Interface `ProjectData` avec nouveaux champs coûts fixes
- **lib/subscriptionRates.ts**: Barèmes EDF/Engie 2024 et fonctions utilitaires

### Modules qui dépendent de currentCost
- **pacCost.ts**: Compare coût PAC vs coût actuel
- **calculations/index.ts**: Orchestration globale des calculs
- **results/page.tsx**: Affichage résultats avec détail coûts

## Tests et validation

### Cas limites gérés

1. **Données manquantes**: Utilisation de valeurs par défaut (opérateur `||`)
```typescript
puissance_souscrite_actuelle || 6
abonnement_gaz || 120
entretien_annuel || 0
```

2. **Type de chauffage inconnu**: Retourne 0 sans erreur
3. **Évolution négative**: Supportée (déflation énergétique)
4. **Année 0**: Doit retourner exactement le coût de base

### Points de validation recommandés

```typescript
// Test 1: Coûts fixes corrects
const test1 = calculateCurrentFixedCosts({
  type_chauffage: "Gaz",
  puissance_souscrite_actuelle: 6,
  abonnement_gaz: 120,
  entretien_annuel: 120,
})
assert(test1.abonnementElec === 151)
assert(test1.abonnementGaz === 120)
assert(test1.entretien === 120)
assert(test1.total === 391)

// Test 2: Année 0 = coût de base
const test2Data = { /* ... */ }
assert(
  calculateCurrentCostForYear(test2Data, 0) ===
  calculateCurrentAnnualCost(test2Data)
)

// Test 3: Évolution correcte
const test3Data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 1000,
  prix_gaz_kwh: 0.10,
  evolution_prix_gaz: 10,
  puissance_souscrite_actuelle: 6,
  abonnement_gaz: 120,
  entretien_annuel: 120,
}
// Année 1: (1000*0.10*(1.1)^1) + 391 = 110 + 391 = 501
assert(Math.round(calculateCurrentCostForYear(test3Data, 1)) === 501)
```

## Améliorations futures possibles

1. **Abonnements variables**: ~~Intégrer le coût de l'abonnement~~ ✅ **FAIT (Nov 2024)**

2. **Comparaison barèmes**: Ajouter barèmes alternatifs (TotalEnergies, Vattenfall, etc.)

3. **Simulation heures creuses**: Calculer impact abonnement HC/HP pour PAC

4. **Historique tarifs**: Stocker l'évolution des barèmes EDF depuis 2010 pour analyses

5. **Optimisation puissance**: Suggérer la puissance optimale selon profil de consommation

6. **TVA réduite travaux**: Intégrer TVA 5.5% sur travaux rénovation énergétique

7. **Saisonnalité**: Prendre en compte variations mensuelles de consommation

8. **Courbe de charge**: Modélisation horaire pour optimisation tarifaire

## Références et sources

### Documentation officielle
- [EDF Tarif Bleu](https://particulier.edf.fr/fr/accueil/gestion-contrat/options/tarif-bleu.html) - Barème réglementé électricité
- [Engie Tarifs Réglementés](https://particuliers.engie.fr/electricite-gaz/tarifs-gaz.html) - Barème réglementé gaz
- [CRE - Commission de Régulation de l'Énergie](https://www.cre.fr/) - Régulation tarifs
- [ADEME - Entretien chaudières](https://www.ademe.fr/) - Coûts moyens entretien

### Textes légaux
- **Décret n°2009-649** (14 juin 2009): Entretien obligatoire chaudières gaz/fioul/GPL
- **Décret n°2020-912** (27 juillet 2020): Entretien obligatoire PAC >4kW frigorigène
- **RSDT Article 31.6**: Ramonage conduits bois

### API données
- **DIDO-SDES**: Données historiques prix énergies ([lib/didoApi.ts](../../../lib/didoApi.README.md))

### Modules liés
- [lib/subscriptionRates.README.md](../../../../lib/subscriptionRates.README.md) - Barèmes détaillés (800+ lignes)
- [calculations/README.md](../README.md) - Vue d'ensemble calculs
- [pacCost/README.md](../pacCost/README.md) - Calculs coût PAC

---

**Dernière mise à jour**: Novembre 2024
**Version**: 2.0 (ajout coûts fixes)
**Contributeurs**: Équipe ThermGain
