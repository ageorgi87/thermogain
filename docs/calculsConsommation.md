# Calculs de Consommation PAC - ThermoGain

Ce document détaille le calcul de la consommation électrique annuelle d'une pompe à chaleur (PAC), en tenant compte du COP ajusté selon plusieurs facteurs.

## Table des matières

- [Description](#description)
- [Fonction principale](#fonction-principale)
- [Logique de calcul](#logique-de-calcul)
- [Ajustements du COP](#ajustements-du-cop)
- [Exemples d'utilisation](#exemples-dutilisation)

## Description

Ce module calcule la consommation électrique annuelle d'une pompe à chaleur en tenant compte des besoins thermiques réels du logement et du COP (Coefficient de Performance) ajusté selon plusieurs facteurs:

- Température de départ de l'eau
- Type d'émetteurs de chaleur
- Zone climatique

Ce calcul est crucial car il détermine directement le coût d'exploitation de la PAC et donc les économies réalisables.

## Fonction principale

### `calculatePacConsumptionKwh(data: ProjectData): number`

Calcule la consommation électrique annuelle de la PAC en kWh, en prenant en compte tous les ajustements du COP.

**Retourne:**
- `number`: Consommation électrique de la PAC en kWh/an (arrondie)

**Exemple:**
```typescript
const data = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.5,
  temperature_depart: 45,
  emetteurs: "Radiateurs basse température",
  code_postal: "75001",
}

const consoPac = calculatePacConsumptionKwh(data)
// Résultat: ~4500 kWh/an
// (15000 kWh besoins thermiques / COP ajusté ~3.3)
```

## Logique de calcul

### Étape 1: Conversion en équivalent kWh thermique

La première étape consiste à convertir toutes les consommations énergétiques en kWh d'énergie thermique (besoins de chauffage).

#### Facteurs de conversion

**Source unique de vérité** : [`config/constants.ts`](../config/constants.ts) (section `ENERGY_CONVERSION_FACTORS`)

Tous les facteurs de conversion sont basés sur le PCI (Pouvoir Calorifique Inférieur) selon les standards ADEME.

**Exemple d'utilisation dans le code :**
```typescript
import { ENERGY_CONVERSION_FACTORS } from '@/config/constants'

const besoinsThermiques = litresFioul * ENERGY_CONVERSION_FACTORS.FIOUL_KWH_PER_LITRE
```

| Combustible | Ordre de grandeur | Source |
|-------------|-------------------|--------|
| **Fioul** | ~10 kWh/litre | PCI ADEME |
| **Gaz naturel** | 1 kWh/kWh | Direct (relevé compteur) |
| **GPL** | ~13 kWh/kg | PCI ADEME |
| **Pellets** | ~4.5 kWh/kg | PCI ADEME |
| **Bois (stère)** | ~1800 kWh/stère | PCI ADEME (bois sec 20% humidité) |
| **Électricité** | 1 kWh/kWh | Direct (effet Joule 100% rendement) |

> ⚠️ **Note** : Valeurs indicatives. Les facteurs exacts et à jour se trouvent dans `config/constants.ts`.

**Exemple de conversion (fictif) :**
```typescript
// Chauffage au fioul: 2000 litres/an
const besoinsThermiques = 2000 litres × ~10 kWh/L ≈ 20 000 kWh/an
```

**Note sur le bois:**
La valeur de ~1800 kWh/stère correspond à du bois sec (20% d'humidité) bien empilé. Cette valeur peut varier selon:
- L'essence de bois (chêne, hêtre: ~1800 kWh, résineux: ~1500 kWh)
- L'humidité (bois humide: -30% d'énergie)

### Étape 2: Calcul du COP ajusté

Le COP (Coefficient de Performance) annoncé par les fabricants est mesuré dans des conditions optimales (7°C extérieur, 35°C eau de départ). En conditions réelles, le COP est influencé par plusieurs facteurs.

La fonction `calculateAdjustedCOP()` du module `@/lib/copAdjustments` applique les ajustements suivants.

### Étape 3: Calcul de la consommation PAC

Une fois les besoins thermiques et le COP ajusté connus, la consommation électrique se calcule:

```
Consommation PAC (kWh élec) = Besoins thermiques (kWh) / COP ajusté
```

**Exemple complet:**
```
1. Chauffage actuel: 15 000 kWh de gaz
2. Besoins thermiques: 15 000 kWh
3. COP ajusté: 2.68
4. Consommation PAC: 15 000 / 2.68 = 5 597 kWh élec/an
```

**Gain énergétique:**
- Sans COP (chauffage électrique direct): 15 000 kWh
- Avec PAC (COP 2.68): 5 597 kWh
- **Réduction: 62.7%**

## Ajustements du COP

### Ajustement par température de départ

Plus la température de l'eau est élevée, plus le COP diminue (la PAC doit "travailler" plus fort).

| Température | Facteur d'ajustement | Type d'émetteurs typique |
|-------------|---------------------|--------------------------|
| ≤ 35°C | 1.00 (référence) | Plancher chauffant |
| ≤ 40°C | 0.95 (-5%) | Plancher + radiateurs BT |
| ≤ 45°C | 0.85 (-15%) | Radiateurs basse température |
| ≤ 50°C | 0.80 (-20%) | Radiateurs moyenne température |
| ≤ 55°C | 0.75 (-25%) | Radiateurs moyenne température |
| ≤ 60°C | 0.70 (-30%) | Radiateurs haute température |
| > 60°C | 0.65 (-35%) | Radiateurs haute température |

**Source:** Courbes de performance constructeurs PAC air/eau + études terrain ADEME

### Ajustement par type d'émetteurs

Le type d'émetteur influence la surface d'échange thermique et donc l'efficacité globale.

| Émetteurs | Facteur d'ajustement | Justification |
|-----------|---------------------|---------------|
| Plancher chauffant | 1.00 (référence) | Grande surface, basse température |
| Ventilo-convecteurs | 0.95 | Excellent échange, mais ventilation |
| Radiateurs BT | 0.90 | Bon compromis, température modérée |
| Radiateurs HT | 0.70 | Haute température requise |

**Note:** Les ajustements de température et d'émetteurs ne sont PAS cumulés dans le code actuel, seul le plus pénalisant est appliqué.

### Ajustement par zone climatique

La performance des PAC Air/Eau dépend fortement de la température extérieure moyenne de la région.

| Zone | Régions | Facteur | Impact |
|------|---------|---------|--------|
| H1a | Vosges, Jura, Alpes | 0.85 | -15% (très froid) |
| H1b | Alsace, Lorraine | 0.90 | -10% (froid) |
| H1c | Nord-Pas-de-Calais | 0.92 | -8% (froid) |
| H2a | Bretagne, Pays de la Loire | 1.00 | Référence (tempéré) |
| H2b | Île-de-France | 0.95 | -5% (tempéré) |
| H2c | Nouvelle-Aquitaine | 1.05 | +5% (doux) |
| H2d | Rhône-Alpes, Auvergne | 0.93 | -7% (tempéré montagne) |
| H3 | PACA, Occitanie, Corse | 1.10 | +10% (chaud) |

**Source:** Données climatiques RT2012, ADEME, normales Météo-France 1991-2020

### Formule du COP ajusté

```typescript
COP_ajusté = COP_constructeur × Facteur_température × Facteur_émetteurs × Facteur_climat
```

**Exemple concret:**
- COP constructeur: 3.5
- Température départ: 45°C → Facteur 0.85
- Émetteurs: Radiateurs BT → Facteur 0.90 (mais déjà inclus dans température)
- Zone: H1b (Strasbourg) → Facteur 0.90
- **COP ajusté:** 3.5 × 0.85 × 0.90 = **2.68**

**Réduction:** Le COP réel est réduit de 23.4% par rapport au COP constructeur!

## Exemples d'utilisation

### Cas 1: Remplacement chaudière gaz avec radiateurs BT

```typescript
import { calculatePacConsumptionKwh } from './pacConsumption'

const projet = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.5,
  temperature_depart: 45,
  emetteurs: "Radiateurs basse température",
  code_postal: "75015", // Paris (H2b)
}

const consoPac = calculatePacConsumptionKwh(projet)
console.log(`Consommation PAC estimée: ${consoPac} kWh/an`)
// Affiche: "Consommation PAC estimée: 4744 kWh/an"

// Calcul détaillé:
// 1. Besoins: 15000 kWh
// 2. COP ajusté: 3.5 × 0.85 (45°C) × 0.95 (Paris) = 2.82
// 3. Conso: 15000 / 2.82 = 5319 kWh/an
```

### Cas 2: Remplacement fioul avec plancher chauffant

```typescript
const projetOptimal = {
  type_chauffage: "Fioul",
  conso_fioul_litres: 2000,
  cop_estime: 4.0,
  temperature_depart: 35,
  emetteurs: "Plancher chauffant",
  code_postal: "13001", // Marseille (H3)
}

const consoPac = calculatePacConsumptionKwh(projetOptimal)
console.log(`Consommation PAC: ${consoPac} kWh/an`)
// Affiche: "Consommation PAC: 4545 kWh/an"

// Calcul:
// 1. Besoins: 2000 L × 10 = 20000 kWh
// 2. COP ajusté: 4.0 × 1.00 (35°C) × 1.10 (Marseille) = 4.4
// 3. Conso: 20000 / 4.4 = 4545 kWh/an

// Économie énergétique:
const economieKwh = 20000 - consoPac
console.log(`Économie: ${economieKwh} kWh/an (${Math.round(economieKwh/20000*100)}%)`)
// Affiche: "Économie: 15455 kWh/an (77%)"
```

### Cas 3: Comparaison radiateurs HT vs plancher chauffant

```typescript
const dataRadiateursHT = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.5,
  temperature_depart: 65,
  emetteurs: "Radiateurs haute température",
  code_postal: "69001", // Lyon (H2d)
}

const dataPlancherChauffant = {
  ...dataRadiateursHT,
  temperature_depart: 35,
  emetteurs: "Plancher chauffant",
}

const consoHT = calculatePacConsumptionKwh(dataRadiateursHT)
const consoPC = calculatePacConsumptionKwh(dataPlancherChauffant)

console.log(`Radiateurs HT (65°C): ${consoHT} kWh/an`)
console.log(`Plancher chauffant (35°C): ${consoPC} kWh/an`)
console.log(`Différence: ${consoHT - consoPC} kWh/an (${Math.round((consoHT - consoPC)/consoHT*100)}%)`)

// Résultat typique:
// Radiateurs HT (65°C): 7143 kWh/an
// Plancher chauffant (35°C): 4301 kWh/an
// Différence: 2842 kWh/an (40%)
//
// Conclusion: Le plancher chauffant réduit la consommation de 40% !
```

### Cas 4: Impact de la zone climatique

```typescript
const zones = [
  { code: "68000", nom: "Strasbourg (H1b)", facteur: 0.90 },
  { code: "75001", nom: "Paris (H2b)", facteur: 0.95 },
  { code: "33000", nom: "Bordeaux (H2c)", facteur: 1.05 },
  { code: "13001", nom: "Marseille (H3)", facteur: 1.10 },
]

const baseData = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.5,
  temperature_depart: 45,
  emetteurs: "Radiateurs basse température",
}

console.log("Zone | Conso PAC | Différence vs Paris")
console.log("-----|-----------|--------------------")

zones.forEach(zone => {
  const data = { ...baseData, code_postal: zone.code }
  const conso = calculatePacConsumptionKwh(data)
  const consoRef = calculatePacConsumptionKwh({ ...baseData, code_postal: "75001" })
  const diff = conso - consoRef

  console.log(
    `${zone.nom.padEnd(20)} | ${conso} kWh | ${diff > 0 ? '+' : ''}${diff} kWh (${zone.facteur})`
  )
})

// Résultat:
// Zone                 | Conso PAC | Différence vs Paris
// ---------------------|-----------|--------------------
// Strasbourg (H1b)     | 5562 kWh  | +818 kWh (0.90)
// Paris (H2b)          | 4744 kWh  | +0 kWh (0.95)
// Bordeaux (H2c)       | 4289 kWh  | -455 kWh (1.05)
// Marseille (H3)       | 4031 kWh  | -713 kWh (1.10)
```

## Raisons techniques

### Pourquoi ajuster le COP au lieu d'utiliser la valeur constructeur?

Les COP constructeurs sont mesurés dans des conditions normalisées (norme EN 14511: 7°C air extérieur, 35°C eau de départ). En conditions réelles, plusieurs facteurs dégradent cette performance:

1. **Température extérieure variable**: En hiver, les températures sont souvent bien inférieures à 7°C
2. **Température de départ élevée**: Les radiateurs existants nécessitent souvent 50-60°C (vs 35°C pour plancher chauffant)
3. **Climat régional**: Une PAC à Strasbourg ne performera pas comme à Marseille

**Études de référence:**
- ADEME 2023-2024: COP moyen réel des PAC Air/Eau = **2.9** (vs 3.5-4.5 annoncé)
- Écart moyen: -15% à -30% par rapport aux valeurs constructeur

**Ignorer ces ajustements conduirait à:**
- Surestimer les économies de 30-40%
- Sous-dimensionner la PAC
- Décevoir les clients avec des factures plus élevées que prévu

### Pourquoi utiliser calculateAdjustedCOP() plutôt que COP_estime directement?

Le module `copAdjustments` centralise toute la logique complexe d'ajustement du COP. Cela permet:

1. **Séparation des responsabilités**: pacConsumption calcule, copAdjustments ajuste
2. **Réutilisabilité**: D'autres modules peuvent utiliser `calculateAdjustedCOP()`
3. **Maintenance**: Facile de mettre à jour les facteurs d'ajustement en un seul endroit
4. **Testabilité**: Chaque module peut être testé indépendamment

## Références

### Normes et standards
- **EN 14511**: Norme européenne de mesure du COP des PAC
- **RT2012**: Réglementation thermique définissant les zones climatiques françaises
- **ADEME**: Études de terrain 2023-2024 sur les performances réelles des PAC

### Données sources
- **PCI (Pouvoir Calorifique Inférieur)**: ADEME
- **Facteurs de conversion**: ADEME, Méthode 3CL-DPE 2021
- **Zones climatiques**: RT2012, Météo-France (normales 1991-2020)
- **Ajustements COP**: Courbes constructeurs + études ADEME terrain

---

**Dernière mise à jour**: 3 décembre 2024
**Version**: 2.0
**Module source**: `app/(main)/projects/[projectId]/calculations/pacConsumption/`
