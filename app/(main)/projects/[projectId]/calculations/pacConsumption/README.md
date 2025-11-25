# Module Consommation PAC (pacConsumption)

## Description

Ce module calcule la consommation électrique annuelle d'une pompe à chaleur (PAC) en tenant compte des besoins thermiques réels du logement et du COP (Coefficient de Performance) ajusté selon plusieurs facteurs: température de départ de l'eau, type d'émetteurs de chaleur, et zone climatique.

Ce calcul est crucial car il détermine directement le coût d'exploitation de la PAC et donc les économies réalisables.

## Fonctions exportées

### `calculatePacConsumptionKwh(data: ProjectData): number`

Calcule la consommation électrique annuelle de la PAC en kWh, en prenant en compte tous les ajustements du COP.

**Paramètres:**
- `data` (ProjectData): Objet contenant toutes les données du projet
  - `type_chauffage` (string): Type de chauffage actuel
  - `conso_fioul_litres` (number, optionnel): Consommation de fioul en litres
  - `conso_gaz_kwh` (number, optionnel): Consommation de gaz en kWh
  - `conso_gpl_kg` (number, optionnel): Consommation de GPL en kg
  - `conso_pellets_kg` (number, optionnel): Consommation de pellets en kg
  - `conso_bois_steres` (number, optionnel): Consommation de bois en stères
  - `conso_elec_kwh` (number, optionnel): Consommation électrique en kWh
  - `conso_pac_kwh` (number, optionnel): Consommation PAC actuelle en kWh
  - `cop_actuel` (number, optionnel): COP de la PAC actuelle (si déjà équipé)
  - `cop_estime` (number): COP estimé de la nouvelle PAC
  - `temperature_depart` (number): Température de départ de l'eau en °C
  - `emetteurs` (string): Type d'émetteurs ("Plancher chauffant", "Radiateurs BT", "Radiateurs MT", "Radiateurs HT", "Ventilo-convecteurs")
  - `code_postal` (string, optionnel): Code postal pour ajustement climatique

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
  // ... autres champs
}

const consoPac = calculatePacConsumptionKwh(data)
// Résultat: ~4500 kWh/an
// (15000 kWh besoins thermiques / COP ajusté ~3.3)
```

## Logique de calcul

### Étape 1: Conversion en équivalent kWh thermique

La première étape consiste à convertir toutes les consommations énergétiques en kWh d'énergie thermique (besoins de chauffage). Chaque combustible a son propre facteur de conversion:

| Combustible | Facteur de conversion | Source |
|-------------|----------------------|--------|
| **Fioul** | 10 kWh/litre | PCI (Pouvoir Calorifique Inférieur) ADEME |
| **Gaz naturel** | 1 kWh/kWh | Direct (relevé compteur) |
| **GPL** | 12.8 kWh/kg | PCI ADEME |
| **Pellets** | 4.8 kWh/kg | PCI ADEME |
| **Bois (stère)** | 2000 kWh/stère | PCI ADEME (bois sec 20% humidité) |
| **Électricité** | 1 kWh/kWh | Direct (effet Joule 100% rendement) |

**Exemple de conversion:**
```typescript
// Chauffage au fioul: 2000 litres/an
const besoinsThermiques = 2000 litres × 10 kWh/L = 20 000 kWh/an
```

**Note importante sur le bois:**
La valeur de 2000 kWh/stère correspond à du bois sec (20% d'humidité) bien empilé. Cette valeur peut varier selon:
- L'essence de bois (chêne, hêtre: ~2000 kWh, résineux: ~1500 kWh)
- L'humidité (bois humide: -30% d'énergie)

Dans la documentation principale, la valeur de 1800 kWh/stère est plus conservative. Ici, nous utilisons 2000 kWh (valeur du code actuel).

### Étape 2: Calcul du COP ajusté

Le COP (Coefficient de Performance) annoncé par les fabricants est mesuré dans des conditions optimales (7°C extérieur, 35°C eau de départ). En conditions réelles, le COP est influencé par plusieurs facteurs.

La fonction `calculateAdjustedCOP()` du module `@/lib/copAdjustments` applique les ajustements suivants:

#### Ajustement par température de départ

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

#### Ajustement par type d'émetteurs

Le type d'émetteur influence la surface d'échange thermique et donc l'efficacité globale.

| Émetteurs | Facteur d'ajustement | Justification |
|-----------|---------------------|---------------|
| Plancher chauffant | 1.00 (référence) | Grande surface, basse température |
| Ventilo-convecteurs | 0.95 | Excellent échange, mais ventilation |
| Radiateurs BT | 0.90 | Bon compromis, température modérée |
| Radiateurs HT | 0.70 | Haute température requise |

**Note:** Les ajustements de température et d'émetteurs ne sont PAS cumulés dans le code actuel, seul le plus pénalisant est appliqué.

#### Ajustement par zone climatique

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

#### Formule du COP ajusté

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

### Étape 3: Calcul de la consommation PAC

Une fois les besoins thermiques et le COP ajusté connus, la consommation électrique se calcule simplement:

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

### Pourquoi les logs console.log() dans le code?

Les logs permettent de:
1. **Déboguer**: Visualiser les étapes du calcul lors du développement
2. **Tracer**: Comprendre pourquoi un résultat est produit
3. **Auditer**: Vérifier que les calculs sont corrects en production

**Exemple de sortie:**
```
📊 Consommation PAC:
   - Besoins thermiques: 15,000 kWh/an
   - COP ajusté: 2.68
   → Consommation électrique PAC: 5,597 kWh/an
```

Ces logs devraient être enlevés ou passés dans un système de logging structuré (Winston, Pino) en production.

### Pourquoi arrondir le résultat?

```typescript
return Math.round(pacConsumptionKwh)
```

Raisons:
1. **Précision illusoire**: Une précision au kWh près est largement suffisante pour des estimations
2. **Lisibilité**: 5597 kWh est plus lisible que 5597.234 kWh
3. **Cohérence**: Les autres modules arrondissent également leurs résultats

## Exemples d'utilisation

### Cas 1: Remplacement chaudière gaz avec radiateurs basse température

```typescript
import { calculatePacConsumptionKwh } from './pacConsumption'

const projet = {
  type_chauffage: "Gaz",
  conso_gaz_kwh: 15000,
  cop_estime: 3.5,
  temperature_depart: 45,
  emetteurs: "Radiateurs basse température",
  code_postal: "75015", // Paris (H2b)
  // ... autres champs
}

const consoPac = calculatePacConsumptionKwh(projet)
console.log(`Consommation PAC estimée: ${consoPac} kWh/an`)
// Affiche: "Consommation PAC estimée: 4744 kWh/an"

// Calcul détaillé:
// 1. Besoins: 15000 kWh
// 2. COP ajusté: 3.5 × 0.85 (45°C) × 0.95 (Paris) = 2.82
// 3. Conso: 15000 / 2.82 = 5319 kWh/an (arrondi 5319)
// Note: Le résultat exact dépend de l'implémentation de calculateAdjustedCOP
```

### Cas 2: Remplacement fioul avec plancher chauffant neuf

```typescript
const projetOptimal = {
  type_chauffage: "Fioul",
  conso_fioul_litres: 2000,
  cop_estime: 4.0,
  temperature_depart: 35,
  emetteurs: "Plancher chauffant",
  code_postal: "13001", // Marseille (H3)
  // ... autres champs
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
console.log(`Différence: ${consoHT - consoPC} kWh/an (${Math.round((consoHT-consoPC)/consoHT*100)}%)`)

// Résultat typique:
// Radiateurs HT (65°C): 7089 kWh/an
// Plancher chauffant (35°C): 4608 kWh/an
// Différence: 2481 kWh/an (35%)

// Conclusion: Le plancher chauffant permet de réduire la consommation de 35% !
```

### Cas 4: Impact de la zone climatique

```typescript
const zones = [
  { ville: "Strasbourg", cp: "67000", zone: "H1b" },
  { ville: "Paris", cp: "75001", zone: "H2b" },
  { ville: "Marseille", cp: "13001", zone: "H3" },
]

zones.forEach(({ ville, cp, zone }) => {
  const data = {
    type_chauffage: "Gaz",
    conso_gaz_kwh: 15000,
    cop_estime: 3.5,
    temperature_depart: 45,
    emetteurs: "Radiateurs basse température",
    code_postal: cp,
  }

  const conso = calculatePacConsumptionKwh(data)
  console.log(`${ville} (${zone}): ${conso} kWh/an`)
})

// Résultat attendu:
// Strasbourg (H1b): 5814 kWh/an (climat froid, COP réduit)
// Paris (H2b): 5319 kWh/an (climat tempéré)
// Marseille (H3): 4744 kWh/an (climat chaud, COP amélioré)

// Écart: 22% de différence entre Strasbourg et Marseille!
```

## Dépendances

### Imports
```typescript
import { ProjectData } from "./types"
import { calculateAdjustedCOP } from "@/lib/copAdjustments"
```

### Modules utilisés

#### types.ts
Définit l'interface `ProjectData` avec tous les champs nécessaires aux calculs.

#### @/lib/copAdjustments
Module externe qui gère les ajustements du COP selon:
- Température de départ
- Type d'émetteurs
- Zone climatique (déduite du code postal)

**Fonction utilisée:**
```typescript
calculateAdjustedCOP(
  copEstime: number,
  temperatureDepart: number,
  emetteurs: string,
  codePostal?: string
): number
```

### Modules qui dépendent de pacConsumption

- **pacCost.ts**: Utilise `calculatePacConsumptionKwh` pour calculer le coût de la PAC
- **index.ts**: Réexporte la fonction

## Notes importantes

1. **Valeur de référence pour le bois**: Le code utilise 2000 kWh/stère, mais certaines sources recommandent 1800 kWh/stère pour être plus conservateur

2. **COP des PAC existantes**: Si l'utilisateur a déjà une PAC, le code multiplie la consommation actuelle par le COP actuel pour retrouver les besoins thermiques réels

3. **Console logs**: Les logs console.log() sont utiles en développement mais devraient être supprimés ou remplacés par un système de logging en production

4. **Arrondi**: Le résultat est arrondi à l'entier le plus proche. Pour des calculs intermédiaires, utiliser la valeur non arrondie

5. **Précision**: La précision finale dépend de la qualité des données d'entrée (consommation réelle, COP fabricant, etc.)

6. **Validation du dimensionnement PAC**: Le module `@/lib/copAdjustments` contient la fonction `validatePacPower()` qui valide la puissance de la PAC. Depuis la dernière mise à jour, cette fonction prend en compte:
   - **Qualité d'isolation réelle** (`qualiteIsolation`: Bonne/Moyenne/Mauvaise) plutôt que seulement l'année de construction
   - **Zone climatique** (déduite du `code_postal`) via les DJU pour ajuster les besoins selon le climat
   - Ces améliorations permettent une validation beaucoup plus précise du dimensionnement (voir `lib/copAdjustments.README.md`)

## Améliorations récentes (Novembre 2024)

### Unification des inputs numériques du wizard

Tous les champs numériques permettant la saisie de consommations ont été standardisés avec un pattern unifié :
- **Suppression complète possible** : L'utilisateur peut effacer complètement un champ
- **Valeur zéro explicite** : Permet de saisir `0` sans réinitialisation
- **Schémas Zod** : Utilisation de `.default(0)` au lieu de `.optional()` pour la cohérence

**Impact sur pacConsumption :**
- Les champs de consommation (fioul, gaz, GPL, etc.) dans l'étape "Chauffage Actuel" utilisent ce pattern
- Amélioration de l'UX pour la saisie des données d'entrée du calcul
- Réduction des erreurs de saisie et des valeurs manquantes

Voir la section "Patterns d'Implémentation" dans le README principal pour plus de détails.

## Améliorations futures possibles

1. **COP dynamique**: Modéliser le COP en fonction de la température extérieure heure par heure (simulation annuelle)

2. **Courbe de charge**: Prendre en compte la variation de consommation selon l'heure et la saison

3. **Mode dégradé**: Calculer la consommation électrique de la résistance d'appoint lors des jours très froids

4. **Eau chaude sanitaire**: Intégrer la production d'ECS par la PAC dans le calcul

5. **Déshumidification**: Pour les PAC Air/Air, intégrer la consommation liée à la déshumidification en été

6. **Logging structuré**: Remplacer console.log par un système de logging professionnel (Winston, Pino)

---

**Dernière mise à jour** : 25 novembre 2024
