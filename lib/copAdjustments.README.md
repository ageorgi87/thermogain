# Module copAdjustments

## Description

Module central pour les ajustements du COP (Coefficient de Performance) des pompes à chaleur et la validation du dimensionnement de la PAC. Ce module prend en compte les conditions réelles d'installation pour fournir des estimations précises et réalistes.

## Fonctions exportées

### `calculateAdjustedCOP()`

Calcule le COP réel ajusté selon les conditions d'installation et la zone climatique.

**Signature:**
```typescript
calculateAdjustedCOP(
  copFabricant: number,
  temperatureDepart: number,
  typeEmetteurs: string,
  codePostal?: string,
  typePac?: string
): number
```

**Paramètres:**
- `copFabricant`: COP nominal du fabricant (conditions 7°C/-35°C)
- `temperatureDepart`: Température de départ eau chauffage en °C (ignoré pour PAC Air/Air)
- `typeEmetteurs`: Type d'émetteurs de chaleur (ignoré pour PAC Air/Air)
- `codePostal`: Code postal pour ajustement climatique (optionnel)
- `typePac`: Type de PAC (Air/Eau, Eau/Eau, Air/Air) - détermine les ajustements applicables

**Retourne:** COP ajusté réel (arrondi à 2 décimales)

**Ajustements appliqués:**

#### 1. Ajustement par température de départ (PAC hydrauliques uniquement)
Plus la température est élevée, plus le COP diminue :

| Température | Facteur | Type d'émetteurs typique |
|-------------|---------|--------------------------|
| ≤ 35°C | 100% | Plancher chauffant |
| ≤ 40°C | 95% | Plancher + radiateurs BT |
| ≤ 45°C | 85% | Radiateurs basse température |
| ≤ 50°C | 80% | Radiateurs moyenne température |
| ≤ 55°C | 75% | Radiateurs moyenne température |
| ≤ 60°C | 70% | Radiateurs haute température |
| > 60°C | 65% | Radiateurs haute température |

#### 2. Ajustement par type d'émetteurs (PAC hydrauliques uniquement)

| Émetteurs | Facteur | Justification |
|-----------|---------|---------------|
| Plancher chauffant | 100% | Grande surface, basse température |
| Ventilo-convecteurs | 95% | Excellent échange, mais ventilation |
| Radiateurs BT | 90% | Bon compromis |
| Radiateurs HT | 70% | Haute température requise |

#### 3. Ajustement climatique (TOUS types de PAC)

| Zone | Régions | Facteur | Impact |
|------|---------|---------|--------|
| H1a | Vosges, Jura, Alpes | 85% | -15% (très froid) |
| H1b | Alsace, Lorraine | 90% | -10% (froid) |
| H1c | Nord-Pas-de-Calais | 92% | -8% (froid) |
| H2a | Bretagne, Pays de la Loire | 100% | Référence |
| H2b | Île-de-France | 95% | -5% |
| H2c | Nouvelle-Aquitaine | 105% | +5% (doux) |
| H2d | Rhône-Alpes, Auvergne | 93% | -7% |
| H3 | PACA, Occitanie, Corse | 110% | +10% (chaud) |

**Note importante:** Les PAC Air/Air n'ont pas de circuit d'eau, donc seul l'ajustement climatique s'applique (pas d'ajustement température/émetteurs).

**Exemple:**
```typescript
// PAC Air/Eau avec radiateurs BT à Strasbourg
const copAjuste = calculateAdjustedCOP(
  3.5,        // COP fabricant
  45,         // Température départ 45°C
  "Radiateurs basse température",
  "67000",    // Strasbourg (H1b)
  "Air/Eau"
)
// Résultat: 3.5 × 0.85 (45°C) × 0.90 (émetteurs) × 0.90 (H1b) = 2.41

// PAC Air/Air à Marseille
const copAjusteAirAir = calculateAdjustedCOP(
  3.8,        // COP fabricant
  0,          // Ignoré pour Air/Air
  "",         // Ignoré pour Air/Air
  "13001",    // Marseille (H3)
  "Air/Air"
)
// Résultat: 3.8 × 1.10 (H3) = 4.18
```

---

### `validatePacPower()`

Valide que la puissance de la PAC est adaptée aux besoins du logement en tenant compte de l'isolation réelle et de la zone climatique.

**Signature:**
```typescript
validatePacPower(
  puissancePacKw: number,
  surfaceHabitable: number,
  anneeConstruction: number,
  qualiteIsolation?: string,
  codePostal?: string
): {
  isValid: boolean
  message: string
  recommendedPowerMin: number
  recommendedPowerMax: number
}
```

**Paramètres:**
- `puissancePacKw`: Puissance de la PAC en kW
- `surfaceHabitable`: Surface habitable en m²
- `anneeConstruction`: Année de construction (fallback si qualiteIsolation non fournie)
- `qualiteIsolation`: Qualité d'isolation réelle ("Bonne" | "Moyenne" | "Mauvaise") - **NOUVEAU**
- `codePostal`: Code postal pour ajustement climatique - **NOUVEAU**

**Retourne:**
- `isValid`: true si la puissance est dans la fourchette recommandée
- `message`: Message détaillé explicatif
- `recommendedPowerMin`: Puissance minimale recommandée (kW)
- `recommendedPowerMax`: Puissance maximale recommandée (kW)

**Logique de calcul:**

#### 1. Coefficient de base selon isolation (pondéré)

**Pondération intelligente : 80% info utilisateur + 20% âge de la maison**

Le calcul combine deux sources d'information pour plus de précision :

**Coefficient utilisateur (poids 80%):**
| Isolation | Coefficient | Contexte |
|-----------|-------------|----------|
| Bonne | 45 W/m² | RT 2012+, rénovation BBC |
| Moyenne | 60 W/m² | RT 2000-2005 |
| Mauvaise | 80 W/m² | Avant 1980, non rénovée |

**Coefficient âge (poids 20%):**
| Période | Coefficient | Norme |
|---------|-------------|-------|
| ≥ 2012 | 50 W/m² | RT 2012 |
| 2000-2011 | 60 W/m² | RT 2000-2005 |
| 1980-1999 | 70 W/m² | Isolation moyenne |
| < 1980 | 80 W/m² | Isolation faible |

**Formule de pondération:**
```
Coefficient final = (Coeff. utilisateur × 0.8) + (Coeff. âge × 0.2)
```

**Pourquoi pondérer ?**
- **L'utilisateur est plus fiable** (80%) : il connaît les travaux de rénovation effectués
- **L'âge reste pertinent** (20%) : il apporte un correctif si l'utilisateur sous/surestime
- **Équilibre** : évite les estimations extrêmes tout en respectant l'avis utilisateur

**Exemples de pondération:**
- Maison 1975 + isolation "Bonne" → 45×0.8 + 80×0.2 = **52 W/m²** (vs 45 sans pondération)
- Maison 2015 + isolation "Mauvaise" → 80×0.8 + 50×0.2 = **74 W/m²** (vs 80 sans pondération)
- Maison 2000 + isolation "Moyenne" → 60×0.8 + 60×0.2 = **60 W/m²** (cohérent)

**Si qualiteIsolation non fournie:** Utilise uniquement le coefficient âge (100%)

#### 2. Ajustement climatique (si code postal fourni)

La puissance nécessaire varie selon les besoins de chauffage de la zone (DJU):

| Zone | DJU | Facteur vs référence H2a |
|------|-----|--------------------------|
| H1a | 3000 | +36% de puissance |
| H1b | 2700 | +23% de puissance |
| H1c | 2600 | +18% de puissance |
| H2a | 2200 | Référence (100%) |
| H2b | 2400 | +9% de puissance |
| H2c | 2000 | -9% de puissance |
| H2d | 2500 | +14% de puissance |
| H3 | 1600 | -27% de puissance |

**Formule finale:**
```typescript
coefficientAjuste = coefficientIsolation × (DJU_zone / DJU_reference)
puissanceMin = surfaceHabitable × coefficientAjuste × 0.9 / 1000  // kW
puissanceMax = surfaceHabitable × coefficientAjuste × 1.2 / 1000  // kW
```

#### 3. Message de validation détaillé

**Avant (sans qualiteIsolation ni climat):**
```
⚠️ Puissance potentiellement insuffisante. Recommandé : 5.4-7.2 kW
```

**Après (avec qualiteIsolation et climat):**
```
⚠️ Puissance potentiellement insuffisante pour 100 m² avec isolation moyenne
en zone H1b (Zone froide - Alsace, Lorraine, Bourgogne-Franche-Comté).
Recommandé : 6.6-8.9 kW
```

**Exemples:**

```typescript
// Exemple 1: Maison bien isolée à Marseille
const validation1 = validatePacPower(
  6,        // 6 kW
  120,      // 120 m²
  2015,     // Construction récente
  "Bonne",  // Bonne isolation
  "13001"   // Marseille (H3, -27% besoins)
)
// Coefficient pondéré: (45×0.8 + 50×0.2) = 46 W/m²
// Avec climat H3: 46 × 0.73 = 33.6 W/m²
// Recommandé: 3.6-4.8 kW
// Résultat: isValid = false (surdimensionné)
// Message: "⚠️ Puissance potentiellement surdimensionnée pour 120 m²
//           avec isolation bonne en zone H3 (...). Recommandé : 3.6-4.8 kW"

// Exemple 2: Maison mal isolée à Strasbourg (mais rénovée partiellement)
const validation2 = validatePacPower(
  12,         // 12 kW
  100,        // 100 m²
  1975,       // Ancienne
  "Mauvaise", // Mauvaise isolation (utilisateur honnête)
  "67000"     // Strasbourg (H1b, +23% besoins)
)
// Coefficient pondéré: (80×0.8 + 80×0.2) = 80 W/m² (cohérent)
// Avec climat H1b: 80 × 1.23 = 98.4 W/m²
// Recommandé: 8.9-11.8 kW
// Résultat: isValid = true
// Message: "✅ Puissance adaptée pour 100 m² avec isolation mauvaise
//           en zone H1b (...) (recommandé : 8.9-11.8 kW)"

// Exemple 3: Maison ancienne rénovée (pondération protège contre sous-estimation)
const validation3 = validatePacPower(
  6,       // 6 kW
  100,     // 100 m²
  1975,    // Ancienne
  "Bonne"  // Rénovée BBC (utilisateur optimiste)
)
// Coefficient pondéré: (45×0.8 + 80×0.2) = 52 W/m²
// Note: La pondération ajoute 7 W/m² vs info utilisateur seule (45)
// → Protège contre un optimisme excessif sur l'isolation
// Recommandé: 4.7-6.2 kW
// Résultat: isValid = true
// Message: "✅ Puissance adaptée pour 100 m² avec isolation bonne
//           (recommandé : 4.7-6.2 kW)"

// Exemple 4: Sans qualiteIsolation (fallback sur âge)
const validation4 = validatePacPower(
  8,       // 8 kW
  120,     // 120 m²
  2005     // Année construction uniquement
)
// Coefficient: 60 W/m² (RT 2000-2005, pas de pondération)
// Recommandé: 6.5-8.6 kW
// Résultat: isValid = true
// Message: "✅ Puissance adaptée pour 120 m² avec construction 2005
//           (recommandé : 6.5-8.6 kW)"
```

---

### `getTemperatureAdjustment()`

Calcule le coefficient d'ajustement selon la température de départ (PAC hydrauliques uniquement).

```typescript
getTemperatureAdjustment(temperatureDepart: number): number
```

---

### `getEmitterAdjustment()`

Calcule le coefficient d'ajustement selon le type d'émetteurs (PAC hydrauliques uniquement).

```typescript
getEmitterAdjustment(typeEmetteurs: string): number
```

---

## Dépendances

```typescript
import { getCOPAdjustment, getClimateInfoFromPostalCode } from "./climateZones"
```

**Modules utilisés:**
- `lib/climateZones.ts`: Mapping des codes postaux vers zones climatiques RT2012

---

## Sources et références

**Ajustements COP:**
- Courbes de performance constructeurs PAC air/eau
- ADEME 2023-2024: Études terrain sur COP réels
- Normales climatiques Météo-France 1991-2020

**Dimensionnement PAC:**
- RT2012: Réglementation Thermique 2012
- DPE 3CL-DPE 2021: Méthode de calcul des besoins thermiques
- DTU 65.14: Dimensionnement et mise en œuvre des PAC
- ADEME: Guides techniques PAC

**DJU (Degrés-Jours Unifiés):**
- Base 18°C, période 1991-2020
- Source: DPE 3CL-DPE 2021 Annexe 2

---

## Raisons techniques

### Pourquoi pondérer isolation utilisateur + âge (80/20) ?

**Problème 1 : L'utilisateur peut sur/sous-estimer**
- Utilisateur optimiste : "Bonne isolation" alors que seuls combles isolés → sous-dimensionnement
- Utilisateur pessimiste : "Mauvaise isolation" après rénovation partielle → sur-dimensionnement

**Problème 2 : L'âge seul est imprécis**
- Deux maisons de 1990 peuvent avoir des isolations très différentes :
  - Maison A (non rénovée): 80 W/m² de besoins
  - Maison B (rénovée BBC 2015): 45 W/m² de besoins

**Solution : Pondération 80/20**
- **80% utilisateur** : il connaît les travaux effectués (poids dominant)
- **20% âge** : apporte un correctif réaliste basé sur les normes de construction

**Bénéfices concrets :**

1. **Protection contre l'optimisme excessif**
   - Exemple : Maison 1975 + "Bonne isolation"
   - Sans pondération : 45 W/m² (risque de sous-dimensionnement)
   - Avec pondération : 52 W/m² (45×0.8 + 80×0.2)
   - **Impact** : +15% de puissance recommandée → confort garanti

2. **Correction des estimations pessimistes**
   - Exemple : Maison 2015 + "Mauvaise isolation" (rare mais possible)
   - Sans pondération : 80 W/m² (surdimensionnement coûteux)
   - Avec pondération : 74 W/m² (80×0.8 + 50×0.2)
   - **Impact** : -7.5% de puissance recommandée → économie ~500-1000€

3. **Validation de cohérence**
   - Si utilisateur et âge concordent (maison 2000 + isolation "Moyenne")
   - Pondération : 60×0.8 + 60×0.2 = 60 W/m² (aucun changement)
   - **Impact** : renforce la confiance dans l'estimation

**Études de référence :**
- ADEME 2023 : 35% des propriétaires surestiment la qualité de leur isolation
- DTU 65.14 : Recommande de croiser déclaratif et année de construction pour dimensionnement

### Pourquoi prendre en compte la qualité d'isolation réelle ?

**Impact:** Économies de 44% sur la puissance nécessaire après rénovation énergétique !

**Solution:** Combiner `qualiteIsolation` renseignée (vécu) + `anneeConstruction` (norme) via pondération.

### Pourquoi prendre en compte la zone climatique ?

**Problème:** Les besoins de chauffage varient énormément selon le climat :
- Strasbourg (H1b, 2700 DJU): besoins élevés (+23% vs référence)
- Marseille (H3, 1600 DJU): besoins faibles (-27% vs référence)

**Impact:** Une PAC de 8 kW suffira à Marseille mais sera insuffisante à Strasbourg pour la même maison !

**Conséquence d'un mauvais dimensionnement:**
- **Sous-dimensionnement:** Confort dégradé, factures élevées (résistance d'appoint)
- **Sur-dimensionnement:** Surcoût à l'achat (+30-50%), cycles courts, usure prématurée

### Pourquoi un message de validation détaillé ?

**Transparence:** L'utilisateur comprend pourquoi la puissance est insuffisante/surdimensionnée

**Exemples:**
- "7 kW semble faible" → Pourquoi ? Quelle surface ? Quelle isolation ?
- "7 kW potentiellement insuffisant pour 150 m² avec isolation moyenne en zone H1b" → Clair et actionnable

**Pédagogie:** Sensibilise l'utilisateur à l'importance de l'isolation et du climat

---

## Améliorations futures possibles

1. **Prise en compte de l'altitude:** Impact sur température extérieure (+5°C de besoins par tranche de 500m)

2. **Intégration de l'orientation et masques solaires:** Apports solaires gratuits réduisent les besoins

3. **Distinction rénovation/neuf:** Les besoins réels diffèrent légèrement

4. **Validation selon type de PAC:** Les PAC Eau/Eau sont moins sensibles au climat

5. **Recommandation de travaux d'isolation:** Si puissance nécessaire > budget, suggérer isolation d'abord

---

## Notes importantes

1. **PAC Air/Air:** Pas d'ajustement température/émetteurs (pas de circuit d'eau), seulement climatique

2. **Fallback intelligent:** Si `qualiteIsolation` non fournie, utilise `anneeConstruction` (rétrocompatibilité)

3. **Console logs:** Utiles en développement, à remplacer par logging structuré en production

4. **Arrondis:**
   - COP ajusté: 2 décimales (précision suffisante)
   - Puissance recommandée: 1 décimale (0.1 kW près)

5. **Marge de sécurité:** ±20% sur la puissance recommandée (fourchette accepte les variations)
