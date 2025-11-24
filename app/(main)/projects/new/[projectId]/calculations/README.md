# Documentation des Méthodes de Calcul - ThermoGain

Ce document détaille toutes les méthodes de calcul utilisées dans l'application ThermoGain pour l'estimation des consommations énergétiques, des coûts, et des économies potentielles lors du remplacement d'un système de chauffage par une pompe à chaleur (PAC).

## Table des Matières

1. [Introduction et Contexte](#introduction-et-contexte)
2. [Standards et Normes Utilisés](#standards-et-normes-utilisés)
3. [Zones Climatiques Françaises](#zones-climatiques-françaises)
4. [Calcul du Rendement des Chaudières](#calcul-du-rendement-des-chaudières)
5. [Calcul de la Demande de Chaleur Réelle](#calcul-de-la-demande-de-chaleur-réelle)
6. [Estimation de la Consommation](#estimation-de-la-consommation)
7. [Calcul de la Consommation PAC](#calcul-de-la-consommation-pac)
8. [Calcul des Économies](#calcul-des-économies)
9. [Prix de l'Énergie](#prix-de-lénergie)
10. [Évolution des Prix](#évolution-des-prix)
11. [Exemples Concrets](#exemples-concrets)
12. [Sources et Références](#sources-et-références)

---

## Introduction et Contexte

### Problématique

Lorsqu'un particulier envisage de remplacer son système de chauffage actuel par une pompe à chaleur, il est essentiel de calculer avec précision :
- **La consommation énergétique actuelle** (en tenant compte du rendement réel de l'installation)
- **La consommation future** avec une PAC
- **Les économies potentielles** en euros et en kWh
- **L'impact environnemental** (réduction des émissions de CO2)

### Choix Méthodologiques Principaux

#### 1. Prise en compte du rendement réel des chaudières

**Pourquoi ?**
- Une chaudière ne convertit pas 100% du combustible en chaleur
- Le rendement diminue avec l'âge et le manque d'entretien
- **Impact majeur** : Une chaudière de 20 ans peut avoir un rendement de seulement 60-70% contre 90-95% pour une installation moderne

**Conséquence** :
- Si on ignore le rendement, on sous-estime la demande de chaleur réelle
- Les économies calculées seraient faussées
- **Différence observée** : Jusqu'à 77% d'écart dans les économies entre une chaudière ancienne et moderne

#### 2. Utilisation de données officielles françaises

**Pourquoi ?**
- Conformité avec le DPE (Diagnostic de Performance Énergétique) français
- Cohérence avec ADEME (Agence de la transition écologique)
- Prix de l'énergie actualisés mensuellement via l'API DIDO-SDES

---

## Standards et Normes Utilisés

### 1. DPE 3CL-DPE 2021 (France)

**Description** : Méthode officielle de calcul de la consommation conventionnelle des logements utilisée pour le DPE français depuis juillet 2021.

**Utilisation dans ThermoGain** :
- Formules de rendement des chaudières selon l'année d'installation
- Coefficients de dégradation basés sur l'âge
- Valeurs par défaut pour les installations anciennes

**Référence légale** : Arrêté du 31 mars 2021 relatif au diagnostic de performance énergétique

**Sources** :
- [Ministère de la Transition Écologique - Méthode de calcul 3CL-DPE](https://www.ecologie.gouv.fr/)
- Documentation technique 3CL-DPE 2021 (sections 10.3.1 et 10.3.2)

### 2. ADEME - Étude Performances des PAC (2023-2024)

**Description** : Étude sur 100 foyers équipés de pompes à chaleur en France métropolitaine.

**Résultats clés** :
- **COP moyen PAC Air/Eau** : 2.9
- **COP moyen PAC Géothermique** : 4.3
- **COP par temps froid (-4°C)** : 2.0
- **Variation régionale** : 30% de différence entre le Nord et le Sud de la France

**Utilisation dans ThermoGain** :
- Valeur par défaut du COP : **2.9** pour les PAC Air/Eau
- Permet des calculs réalistes basés sur des performances réelles (et non constructeur)

**Source** : ADEME, Rapport 2023-2024 sur les performances réelles des pompes à chaleur en milieu résidentiel

### 3. EN 15316 (Norme Européenne)

**Description** : Norme européenne pour le calcul des besoins énergétiques et des rendements des systèmes de chauffage.

**Parties pertinentes** :
- **EN 15316-4-1** : Systèmes de combustion/chaudières
- **EN 15316-4-2** : Systèmes de pompes à chaleur

**Utilisation dans ThermoGain** :
- Méthodologie de calcul du rendement saisonnier
- Coefficient de Performance Saisonnier (SPF)

**Source** : European Committee for Standardization (CEN)

### 4. UK Energy Saving Trust & SEDBUK

**Description** : Études britanniques sur l'efficacité saisonnière des chaudières domestiques.

**Résultats clés** :
- Aucune des 40 chaudières à condensation testées n'atteignait son rendement nominal
- Écart entre rendement annoncé (93-99%) et réel (80-85%)
- **90-99% des installateurs** n'ont pas été formés correctement

**Utilisation dans ThermoGain** :
- Facteurs de correction pour tenir compte des performances réelles
- Pénalités d'entretien (7-15% de perte si mal entretenu)

**Sources** :
- UK Energy Saving Trust, Field trial of condensing boilers (2012)
- SEDBUK (Seasonal Efficiency of Domestic Boilers in UK) methodology

---

## Zones Climatiques Françaises

### Principe et Objectif

La France est divisée en **zones climatiques** définies par la réglementation thermique (RT2012) et le DPE 3CL-DPE 2021. Ces zones influencent directement :
- **La consommation de chauffage** : Plus il fait froid, plus on consomme
- **L'efficacité des PAC** : Les PAC sont moins efficaces par temps froid

**Module implémenté** : `lib/climateZones.ts`

### Les 8 Zones Climatiques

| Zone | Nom | Régions principales | DJU* | Température hiver moyenne |
|------|-----|---------------------|------|---------------------------|
| **H1a** | Nord-Est (très froid) | Vosges, Jura, Alpes du Nord | 3000 | -2°C |
| **H1b** | Est (froid) | Alsace, Lorraine, Bourgogne-FC | 2700 | 0°C |
| **H1c** | Nord (froid) | Nord-Pas-de-Calais, Picardie | 2600 | 2°C |
| **H2a** | Ouest (tempéré) | Bretagne, Pays de la Loire | 2200 | 5°C |
| **H2b** | Centre-Ouest (tempéré) | Île-de-France, Centre-VdL | 2400 | 3°C |
| **H2c** | Sud-Ouest (doux) | Nouvelle-Aquitaine | 2000 | 6°C |
| **H2d** | Centre-Sud (tempéré) | Rhône-Alpes, Auvergne | 2500 | 2°C |
| **H3** | Méditerranée (chaud) | PACA, Occitanie, Corse | 1600 | 8°C |

*DJU = Degrés-Jours Unifiés (base 18°C), indicateur du besoin de chauffage

### Mapping Code Postal → Zone Climatique

Le code postal permet de déterminer automatiquement la zone climatique :

```typescript
// Exemple : Strasbourg (67000) → H1b
const zone = getClimateZoneFromPostalCode("67000") // => "H1b"

// Exemple : Marseille (13001) → H3
const zone = getClimateZoneFromPostalCode("13001") // => "H3"

// Exemple : Paris (75001) → H2b
const zone = getClimateZoneFromPostalCode("75001") // => "H2b"
```

**Tous les départements français sont mappés**, y compris :
- Corse (2A, 2B)
- DOM-TOM (971-976)

### Impact sur la Consommation

La consommation de chauffage est **proportionnelle aux DJU** de la zone :

```typescript
Consommation réelle = Consommation de référence × (DJU zone / DJU référence)
```

**Zone de référence** : H2a (Bretagne, 2200 DJU)

#### Exemples concrets

Pour une même maison de 100m² mal isolée (coefficient 150 kWh/m²/an en zone H2a) :

| Ville | Zone | DJU | Facteur | Consommation estimée | Écart vs Paris |
|-------|------|-----|---------|---------------------|----------------|
| **Strasbourg** | H1b | 2700 | 1.23 | **18 450 kWh/an** | +23% |
| **Lille** | H1c | 2600 | 1.18 | **17 700 kWh/an** | +18% |
| **Paris** | H2b | 2400 | 1.09 | **15 000 kWh/an** | Référence |
| **Brest** | H2a | 2200 | 1.00 | **15 000 kWh/an** | 0% |
| **Bordeaux** | H2c | 2000 | 0.91 | **13 650 kWh/an** | -9% |
| **Marseille** | H3 | 1600 | 0.73 | **10 950 kWh/an** | -27% |

**Impact majeur** : Une même maison consomme **68% de plus** à Strasbourg qu'à Marseille !

### Impact sur le COP des PAC

Les pompes à chaleur sont **plus efficaces en climat doux** (températures extérieures élevées).

**Facteurs d'ajustement du COP** (par rapport au COP annoncé) :

| Zone | Facteur COP | Impact sur efficacité |
|------|-------------|----------------------|
| H1a (très froid) | 0.85 | -15% d'efficacité |
| H1b (froid) | 0.90 | -10% |
| H1c (froid) | 0.92 | -8% |
| H2a (tempéré) | 1.00 | Référence |
| H2b (tempéré) | 0.95 | -5% |
| H2c (doux) | 1.05 | +5% |
| H2d (tempéré) | 0.93 | -7% |
| H3 (chaud) | 1.10 | +10% d'efficacité |

#### Exemple

Une PAC Air/Eau avec un COP annoncé de **3.5** :

| Ville | Zone | COP ajusté | Consommation électrique pour 13 000 kWh de chaleur |
|-------|------|------------|---------------------------------------------------|
| **Strasbourg** | H1b | 3.5 × 0.90 = **3.15** | 4 127 kWh/an |
| **Paris** | H2b | 3.5 × 0.95 = **3.33** | 3 903 kWh/an |
| **Marseille** | H3 | 3.5 × 1.10 = **3.85** | 3 377 kWh/an |

**Économie supplémentaire** : Une PAC consomme **22% de moins** à Marseille qu'à Strasbourg pour la même quantité de chaleur !

### Intégration dans les Calculs

#### 1. Estimation de la consommation actuelle

```typescript
// Si le code postal est fourni, ajustement automatique
const consommation = estimateAnnualConsumption({
  surface_habitable: 100,
  annee_construction: 1980,
  isolation_murs: false,
  isolation_combles: false,
  isolation_fenetres: false,
  nombre_occupants: 2,
  code_postal: "67000" // Strasbourg
})
// Résultat : 18 450 kWh/an (vs 15 000 kWh sans ajustement climatique)
```

#### 2. Estimation de la consommation future PAC

Le COP de la PAC sera ajusté selon la zone climatique dans les calculs futurs :

```typescript
const copAjuste = copAnnonce * getCOPAdjustment(codePostal)
const consommationPAC = besoinChaleur / copAjuste
```

### Sources

- **RT2012** : Réglementation Thermique 2012, Annexe 8 - Zonage climatique
- **DPE 3CL-DPE 2021** : Annexe 2 - Zones climatiques et données météorologiques
- **ADEME** : Données climatiques françaises 1991-2020
- **Météo-France** : Normales climatiques par département

### Bénéfices

1. **Précision accrue** : Les estimations tiennent compte du climat local
2. **Comparaisons équitables** : Pas de sous-estimation pour les régions froides
3. **Dimensionnement adapté** : La puissance nécessaire de la PAC varie selon la zone
4. **ROI réaliste** : Les économies prédites sont adaptées à chaque région

---

## Calcul du Rendement des Chaudières

### Principe Général

Le rendement d'une chaudière représente la proportion de l'énergie du combustible qui est effectivement convertie en chaleur utile pour le chauffage.

```
Rendement (%) = (Énergie thermique utile / Énergie contenue dans le combustible) × 100
```

### Facteurs Influençant le Rendement

#### 1. Type de Chaudière

**Chaudières à condensation** :
- Récupèrent la chaleur latente de la vapeur d'eau des fumées
- Rendement théorique : 90-99%
- Rendement réel (neuf, bien réglé) : 90-95%

**Chaudières standard (non-condensation)** :
- Perdent la chaleur des fumées
- Rendement théorique : 75-85%
- Rendement réel : 70-80%

#### 2. Âge de l'Installation

**Dégradation progressive** due à :
- Dépôts de calcaire et encrassement
- Usure des joints et composants
- Dérèglage de la combustion
- Accumulation de boues dans le circuit

**Courbe de dégradation observée** :

| Âge | Chaudière Condensation | Chaudière Standard |
|-----|----------------------|-------------------|
| 0-5 ans | 92% | 78% |
| 5-10 ans | 88% | 74% |
| 10-15 ans | 82% | 69% |
| 15-20 ans | 77% | 64% |
| 20+ ans | 68% | 58% |

**Source** : Compilation d'études ADEME, DPE 3CL-DPE, UK Energy Saving Trust

#### 3. État d'Entretien

**Impact de la maintenance** :

| État | Facteur de Correction | Impact |
|------|---------------------|--------|
| **Bon** (entretien annuel) | 1.00 | Aucune pénalité |
| **Moyen** (entretien tous les 2-3 ans) | 0.93 | -7% de rendement |
| **Mauvais** (aucun entretien) | 0.85 | -15% de rendement |

**Justification** :
- UK Energy Saving Trust : Perte de 10-20% de rendement en 12-18 mois sans entretien
- Étude ADEME : Entretien régulier = maintien à 90%+ de rendement

### Formule de Calcul Implémentée

```typescript
Rendement_réel = Rendement_base(type, âge) × Facteur_entretien(état)
```

**Implémentation** : [lib/boilerEfficiency.ts](../../../../lib/boilerEfficiency.ts)

### Tables de Rendement

#### Chaudières Gaz

**Condensation** :
```typescript
{
  "0-5":   0.92,  // 92%
  "5-10":  0.88,  // 88%
  "10-15": 0.82,  // 82%
  "15-20": 0.77,  // 77%
  "20+":   0.68   // 68%
}
```

**Standard (non-condensation)** :
```typescript
{
  "0-5":   0.78,  // 78%
  "5-10":  0.74,  // 74%
  "10-15": 0.69,  // 69%
  "15-20": 0.64,  // 64%
  "20+":   0.58   // 58%
}
```

#### Chaudières Fioul

**Condensation** (plus rare) :
```typescript
{
  "0-5":   0.90,  // 90%
  "5-10":  0.86,  // 86%
  "10-15": 0.80,  // 80%
  "15-20": 0.74,  // 74%
  "20+":   0.65   // 65%
}
```

**Standard** :
```typescript
{
  "0-5":   0.75,  // 75%
  "5-10":  0.72,  // 72%
  "10-15": 0.68,  // 68%
  "15-20": 0.63,  // 63%
  "20+":   0.58   // 58%
}
```

#### Chauffage Électrique

```typescript
Rendement = 1.00  // 100% (constante)
```

**Justification** : Le chauffage électrique convertit 100% de l'électricité en chaleur (effet Joule). Il n'y a pas de perte de combustion.

#### Systèmes Bois/Pellets

```typescript
{
  "0-5":   0.85,  // 85%
  "5-10":  0.82,  // 82%
  "10-15": 0.80,  // 80%
  "15-20": 0.77,  // 77%
  "20+":   0.75   // 75%
}
```

**Note** : Les poêles à pellets modernes ont généralement un meilleur rendement que les poêles à bois traditionnels.

### Hypothèses et Simplifications

#### Hypothèse 1 : Condensation par défaut selon l'âge

**Pour le gaz et le GPL** :
- Si âge < 15 ans → Assumé condensation
- Si âge ≥ 15 ans → Assumé standard

**Justification** :
- Directive européenne 92/42/CEE (1992) : Rendements minimums
- Réglementation ErP (2015) : Obligation de chaudières à condensation
- En France, depuis ~2010, les chaudières gaz vendues sont majoritairement à condensation

#### Hypothèse 2 : Fioul rarement à condensation

**Par défaut** : Chaudière fioul = standard (non-condensation)

**Justification** :
- Les chaudières fioul à condensation représentent < 10% du parc
- Plus coûteuses et plus rares que les chaudières gaz à condensation

#### Hypothèse 3 : Pas de distinction entre PAC neuves et anciennes

**Pour les PAC** : Rendement = 1.0 (le COP est géré séparément)

**Justification** :
- Les PAC n'ont pas de "rendement" au sens thermodynamique classique
- Leur performance est mesurée par le COP (Coefficient de Performance)
- Le COP est saisi ou estimé séparément

---

## Calcul de la Demande de Chaleur Réelle

### Principe

La demande de chaleur représente la quantité d'énergie thermique nécessaire pour chauffer le logement, indépendamment du système de chauffage utilisé.

### Formule Générale

```
Demande_chaleur (kWh) = Consommation_combustible × Contenu_énergétique_combustible × Rendement_chaudière
```

### Contenu Énergétique des Combustibles

Ces valeurs sont **standardisées** et validées par l'ADEME :

| Combustible | Contenu Énergétique | Unité |
|------------|-------------------|-------|
| **Fioul** | 10 kWh | par litre |
| **Gaz naturel** | 1 kWh | par kWh (compteur) |
| **GPL** | 12.8 kWh | par kg |
| **Pellets (granulés)** | 4.8 kWh | par kg |
| **Bois (bûches sèches)** | 2000 kWh | par stère |
| **Électricité** | 1 kWh | par kWh |

**Sources** :
- ADEME, Facteurs de conversion énergétique
- PCI (Pouvoir Calorifique Inférieur) normalisé

**Implémentation** : [lib/boilerEfficiency.ts](../../../../lib/boilerEfficiency.ts#L167)

### Exemple de Calcul

**Cas : Chaudière gaz de 20 ans, état moyen**

1. **Consommation annuelle** : 15,000 kWh (relevé compteur gaz)
2. **Rendement de la chaudière** :
   - Âge : 20 ans → Tranche "20+"
   - Type : Gaz condensation (supposé, car < 2004)
   - Rendement de base : 0.68 (68%)
   - État : Moyen → Facteur 0.93
   - **Rendement réel** : 0.68 × 0.93 = **0.632 (63.2%)**

3. **Demande de chaleur réelle** :
   ```
   Chaleur = 15,000 kWh × 1 (gaz déjà en kWh) × 0.632
   Chaleur = 9,480 kWh/an
   ```

**Interprétation** : Sur les 15,000 kWh de gaz consommés, seulement 9,480 kWh sont transformés en chaleur utile. Les 5,520 kWh restants (37%) sont perdus dans les fumées et par les parois de la chaudière.

---

## Estimation de la Consommation

### Cas 1 : L'Utilisateur Connaît Sa Consommation

**Méthode** : Utilisation directe des factures ou relevés de compteur.

**Avantages** :
- Précision maximale
- Reflète l'usage réel du foyer

**Données collectées** :
- Consommation annuelle (en litres, kWh, kg, stères selon le combustible)
- Prix unitaire payé

### Cas 2 : L'Utilisateur Ne Connaît Pas Sa Consommation

**Méthode** : Estimation basée sur les caractéristiques du logement (méthode DPE simplifiée).

**Données collectées** :
- Surface habitable (m²)
- Année de construction
- Isolation des murs (oui/non)
- Isolation des combles (oui/non)
- Type de fenêtres (simple/double vitrage)
- Nombre d'occupants

**Formule d'estimation** :

```
Consommation_estimée = Coefficient_base × Surface × Facteur_construction × Facteur_isolation × Facteur_occupants
```

**Implémentation** : [lib/consumptionEstimation.ts](../../../../lib/consumptionEstimation.ts)

#### Coefficients de Base (kWh/m²/an)

Ces coefficients représentent la consommation de chauffage moyenne par m² pour une maison "type" construite après 2000, bien isolée, en climat tempéré français.

| Type de Chauffage | Coefficient de Base |
|------------------|-------------------|
| Gaz | 80 kWh/m²/an |
| Fioul | 85 kWh/m²/an |
| GPL | 80 kWh/m²/an |
| Électrique | 70 kWh/m²/an |
| Bois/Pellets | 75 kWh/m²/an |

**Source** : DPE 3CL-DPE 2021, consommations conventionnelles moyennes

#### Facteur d'Année de Construction

| Période de Construction | Facteur | Justification |
|------------------------|---------|--------------|
| Avant 1948 | 1.8 | Aucune réglementation thermique, murs épais mais très peu isolés |
| 1948-1974 | 1.5 | Avant le premier choc pétrolier, pas de réglementation thermique |
| 1975-1988 | 1.3 | Première réglementation thermique (1974) |
| 1989-2000 | 1.15 | RT 1988 : Amélioration progressive |
| 2001-2005 | 1.0 | RT 2000 : Référence |
| 2006-2012 | 0.85 | RT 2005 : -15% de consommation |
| 2013-2020 | 0.65 | RT 2012 : -30% de consommation (50 kWh/m²/an max) |
| Après 2021 | 0.50 | RE 2020 : Bâtiments à énergie positive |

**Source** : Réglementations thermiques françaises successives (RT 1974, 1988, 2000, 2005, 2012, RE 2020)

#### Facteur d'Isolation

```
Facteur_isolation = 1.0 - (Bonus_murs + Bonus_combles + Bonus_fenêtres)
```

| Isolation | Bonus | Justification |
|-----------|-------|--------------|
| Murs isolés | -0.15 | 20-25% des déperditions thermiques |
| Combles isolés | -0.20 | 25-30% des déperditions thermiques |
| Double vitrage | -0.10 | 10-15% des déperditions thermiques |

**Maximum de réduction** : -0.45 (45% si tout est isolé)

**Source** : ADEME, Répartition des déperditions thermiques dans un logement

#### Facteur d'Occupants

Plus il y a d'occupants, plus il y a d'apports internes de chaleur (métabolisme, électroménager, eau chaude sanitaire).

| Nombre d'Occupants | Facteur |
|-------------------|---------|
| 1 | 1.1 |
| 2 | 1.0 (référence) |
| 3 | 0.95 |
| 4 | 0.90 |
| 5+ | 0.85 |

**Source** : DPE 3CL-DPE, apports internes conventionnels

#### Exemple de Calcul d'Estimation

**Cas : Maison sans données de consommation**

- **Surface** : 120 m²
- **Année de construction** : 1985
- **Isolation murs** : Non
- **Isolation combles** : Oui
- **Fenêtres** : Double vitrage
- **Occupants** : 4 personnes
- **Type de chauffage** : Gaz

**Calcul** :
1. Coefficient de base gaz : **80 kWh/m²/an**
2. Facteur construction (1985 → 1975-1988) : **1.3**
3. Facteur isolation :
   - Murs : Non → 0
   - Combles : Oui → -0.20
   - Fenêtres : Oui → -0.10
   - Total : 1.0 - 0.30 = **0.70**
4. Facteur occupants (4 personnes) : **0.90**

```
Consommation = 80 × 120 × 1.3 × 0.70 × 0.90
Consommation = 80 × 120 × 0.819
Consommation ≈ 7,862 kWh/an
```

**Résultat** : La consommation estimée pour le chauffage est d'environ **7,860 kWh de gaz par an**.

---

## Calcul de la Consommation PAC

### Principe

Une pompe à chaleur ne "produit" pas de chaleur par combustion, mais la transfère d'un milieu froid (air extérieur, sol, eau) vers le logement. Son efficacité est mesurée par le **COP (Coefficient de Performance)**.

### Coefficient de Performance (COP)

```
COP = Énergie thermique fournie / Énergie électrique consommée
```

**Exemple** : Un COP de 3 signifie que pour 1 kWh d'électricité consommé, la PAC fournit 3 kWh de chaleur.

### Valeurs de COP Utilisées

| Type de PAC | COP Moyen (ADEME 2023) | COP Constructeur | COP par temps froid |
|-------------|----------------------|------------------|-------------------|
| **PAC Air/Eau** | 2.9 | 3.5-4.5 | 2.0 (-4°C) |
| **PAC Air/Air** | 2.8 | 3.0-4.0 | 1.8 |
| **PAC Géothermique (Eau/Eau)** | 4.3 | 4.5-5.5 | 3.8 |

**Note importante** : ThermoGain utilise les **COP réels mesurés par ADEME** et non les COP constructeur (souvent mesurés à +7°C extérieur, conditions optimales).

**Source** : ADEME, Étude de performances réelles 2023-2024 sur 100 foyers

### Formule de Calcul

```
Consommation_PAC (kWh élec) = Demande_chaleur (kWh) / COP
```

### Exemple de Calcul Complet

**Remplacement d'une chaudière gaz par une PAC Air/Eau**

**Situation actuelle** :
- Chaudière gaz de 20 ans, état moyen
- Consommation gaz : 15,000 kWh/an
- Prix du gaz : 0.10 €/kWh
- **Coût annuel** : 15,000 × 0.10 = **1,500 €/an**

**Calcul du rendement** :
- Âge 20 ans → Tranche "20+"
- Type gaz condensation
- Rendement base : 0.68
- État moyen → Facteur 0.93
- **Rendement réel** : 0.68 × 0.93 = **0.632 (63.2%)**

**Demande de chaleur réelle** :
```
Chaleur = 15,000 kWh × 0.632 = 9,480 kWh/an
```

**Nouvelle installation PAC** :
- Type : PAC Air/Eau
- COP : 2.9 (moyenne ADEME)
- Prix électricité : 0.21 €/kWh

**Consommation PAC** :
```
Conso_PAC = 9,480 kWh / 2.9 = 3,269 kWh élec/an
```

**Coût annuel PAC** :
```
Coût = 3,269 × 0.21 = 686 €/an
```

**Économies** :
```
Économies = 1,500 - 686 = 814 €/an
```

**Réduction de consommation** :
```
Réduction = (15,000 - 3,269) / 15,000 × 100 = 78.2%
```

---

## Calcul des Économies

### Économies Annuelles

```
Économies_annuelles = Coût_actuel - Coût_PAC
```

Où :
```
Coût_actuel = Consommation_combustible × Prix_unitaire_combustible
Coût_PAC = Consommation_électrique_PAC × Prix_électricité
```

### Période de Retour sur Investissement (ROI)

```
ROI (années) = Coût_installation_net / Économies_annuelles
```

Où :
```
Coût_installation_net = Coût_total_PAC - Aides_financières
```

### Économies sur la Durée de Vie

```
Économies_totales = Économies_annuelles × Durée_vie_PAC - Coût_installation_net
```

**Durée de vie moyenne d'une PAC** : 17 ans (valeur ADEME)

### Prise en Compte de l'Évolution des Prix

Pour des projections plus réalistes, on peut intégrer l'évolution des prix de l'énergie :

```
Économies_futures(année_n) = Coût_actuel × (1 + Taux_évolution_combustible)^n
                            - Coût_PAC × (1 + Taux_évolution_électricité)^n
```

**Taux d'évolution moyens** (basés sur l'API DIDO-SDES) :
- Gaz : +4% par an
- Fioul : +3% par an
- Électricité : +3% par an

**Source** : Données historiques DIDO-SDES, moyennes pondérées (50% 1 an, 30% 5 ans, 20% 10 ans)

---

## Prix de l'Énergie

### Source des Prix : API DIDO-SDES

ThermoGain utilise l'API officielle du Service des Données et Études Statistiques (SDES) du Ministère de la Transition Écologique.

**API** : `https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1`

**Dataset** : Conjoncture mensuelle de l'énergie (ID: 631b03afb61e5c6479370169)

### Fichiers de Données Utilisés

| Énergie | RID (Resource ID) | Colonne Prix |
|---------|------------------|-------------|
| Fioul | daf4715a-0795-4098-bdb1-d90b6e6a568d | PX_PETRO_FOD_100KWH_C1 |
| Électricité | cd28227c-bc1e-401b-8d42-3073497c2973 | PX_ELE_D_TTES_TRANCHES |
| Gaz | 9bb3b4e5-91e7-4ee5-95d9-aef38471ee75 | PX_GAZ_D_TTES_TRANCHES |
| Bois | 0bf930dc-bfac-4e6f-a063-ec1774c6d029 | PX_BOIS_GRANVRAC_100KWH |

**Implémentation** : [lib/didoApi.ts](../../../../lib/didoApi.ts)

### Conversion des Unités

Les prix dans l'API sont en **€/100 kWh**. ThermoGain les convertit vers les unités appropriées :

```typescript
Prix_fioul (€/L) = Prix_API (€/kWh) × 10 kWh/L
Prix_gaz (€/kWh) = Prix_API (€/kWh)
Prix_GPL (€/kg) = Prix_API (€/kWh) × 12.8 kWh/kg
Prix_bois (€/kg) = Prix_API (€/kWh) × 4.8 kWh/kg
Prix_électricité (€/kWh) = Prix_API (€/kWh)
```

**Implémentation** : [lib/energyPriceCache.ts](../../../../lib/energyPriceCache.ts#L24)

### Système de Cache

**Durée de validité** : 1 mois (calendaire)

**Justification** :
- Les prix de l'énergie évoluent mensuellement
- Évite des appels API excessifs
- Garantit des prix à jour sans surcharge du serveur

**Mécanisme** :
1. Vérification du cache en base de données (table `EnergyPriceCache`)
2. Si cache valide (même mois et année) → Utilisation du prix en cache
3. Sinon → Appel API DIDO → Mise à jour du cache

**Implémentation** : [lib/energyPriceCache.ts](../../../../lib/energyPriceCache.ts)

### Valeurs par Défaut (en cas d'erreur API)

| Énergie | Prix par Défaut | Unité |
|---------|---------------|-------|
| Fioul | 1.15 | €/litre |
| Gaz | 0.10 | €/kWh |
| GPL | 1.60 | €/kg |
| Bois (pellets) | 0.26 | €/kg |
| Électricité | 0.2516 | €/kWh |

**Source** : Prix moyens observés en France en 2024

---

## Évolution des Prix

### Méthode de Calcul

ThermoGain calcule les taux d'évolution annuels moyens sur plusieurs périodes :

1. **Évolution 1 an** : Comparaison des 12 derniers mois vs 12 mois précédents
2. **Évolution 5 ans** : Comparaison moyennes glissantes (12 mois récents vs 12 mois il y a 5 ans), annualisée
3. **Évolution 10 ans** : Comparaison moyennes glissantes (12 mois récents vs 12 mois il y a 10 ans), annualisée

**Formule générale** :
```
Taux_évolution_annuel (%) = ((Prix_récent - Prix_ancien) / Prix_ancien) × 100 / Nombre_années
```

### Moyenne Pondérée

Pour obtenir un taux d'évolution représentatif, ThermoGain utilise une moyenne pondérée :

```
Évolution_pondérée = (50% × Évol_1an) + (30% × Évol_5ans) + (20% × Évol_10ans)
```

**Justification des poids** :
- **50% sur 1 an** : Capture les tendances récentes (crises énergétiques, politiques tarifaires)
- **30% sur 5 ans** : Lisse les variations court terme, capture les tendances moyen terme
- **20% sur 10 ans** : Capture les tendances long terme (transition énergétique)

**Implémentation** : [lib/didoApi.ts](../../../../lib/didoApi.ts#L147)

### Valeurs Typiques Observées (2000-2024)

| Énergie | Évolution Moyenne | Remarques |
|---------|------------------|-----------|
| Fioul | +3% par an | Forte volatilité (prix du pétrole) |
| Gaz | +4% par an | Impact guerre Ukraine 2022 |
| GPL | +3% par an | Suit le pétrole |
| Bois/Pellets | +2% par an | Plus stable, mais augmentation demande |
| Électricité | +3% par an | Tarifs réglementés vs marché |

**Source** : Analyse des données DIDO-SDES sur 20 ans

---

## Exemples Concrets

### Exemple 1 : Chaudière Gaz Ancienne (20 ans, mauvais état)

**Situation** :
- Type : Chaudière gaz
- Âge : 20 ans
- État : Mauvais (pas d'entretien depuis plusieurs années)
- Consommation : 18,000 kWh/an
- Prix gaz : 0.10 €/kWh

**Calcul du rendement** :
- Âge 20 ans, gaz condensation
- Rendement base : 0.68
- État mauvais → Facteur 0.85
- **Rendement réel** : 0.68 × 0.85 = **0.578 (57.8%)**

**Demande de chaleur** :
```
Chaleur = 18,000 × 0.578 = 10,404 kWh/an
```

**Avec PAC Air/Eau (COP 2.9)** :
```
Conso_PAC = 10,404 / 2.9 = 3,588 kWh élec/an
```

**Coûts annuels** :
- Gaz actuel : 18,000 × 0.10 = **1,800 €/an**
- PAC : 3,588 × 0.21 = **753 €/an**
- **Économies : 1,047 €/an** (58% de réduction)

**Conclusion** : Remplacement très rentable, ROI rapide grâce au faible rendement de l'installation actuelle.

---

### Exemple 2 : Chaudière Gaz Récente (5 ans, bon état)

**Situation** :
- Type : Chaudière gaz à condensation
- Âge : 5 ans
- État : Bon (entretien annuel)
- Consommation : 12,000 kWh/an
- Prix gaz : 0.10 €/kWh

**Calcul du rendement** :
- Âge 5 ans, gaz condensation
- Rendement base : 0.92
- État bon → Facteur 1.0
- **Rendement réel** : 0.92 × 1.0 = **0.92 (92%)**

**Demande de chaleur** :
```
Chaleur = 12,000 × 0.92 = 11,040 kWh/an
```

**Avec PAC Air/Eau (COP 2.9)** :
```
Conso_PAC = 11,040 / 2.9 = 3,807 kWh élec/an
```

**Coûts annuels** :
- Gaz actuel : 12,000 × 0.10 = **1,200 €/an**
- PAC : 3,807 × 0.21 = **799 €/an**
- **Économies : 401 €/an** (33% de réduction)

**Conclusion** : Économies moindres qu'avec une chaudière ancienne, mais toujours intéressantes. Le remplacement est plus pertinent dans une logique environnementale ou en prévision de l'augmentation des prix du gaz.

---

### Exemple 3 : Chaudière Fioul Ancienne (25 ans)

**Situation** :
- Type : Chaudière fioul standard
- Âge : 25 ans
- État : Moyen
- Consommation : 2,500 litres/an
- Prix fioul : 1.15 €/litre

**Calcul du rendement** :
- Âge 25 ans, fioul standard
- Rendement base : 0.58
- État moyen → Facteur 0.93
- **Rendement réel** : 0.58 × 0.93 = **0.539 (53.9%)**

**Demande de chaleur** :
```
Chaleur = 2,500 L × 10 kWh/L × 0.539 = 13,475 kWh/an
```

**Avec PAC Air/Eau (COP 2.9)** :
```
Conso_PAC = 13,475 / 2.9 = 4,647 kWh élec/an
```

**Coûts annuels** :
- Fioul actuel : 2,500 × 1.15 = **2,875 €/an**
- PAC : 4,647 × 0.21 = **976 €/an**
- **Économies : 1,899 €/an** (66% de réduction)

**Conclusion** : Cas idéal pour un remplacement. Économies maximales grâce au faible rendement et au prix élevé du fioul.

---

### Exemple 4 : Chauffage Électrique (convecteurs)

**Situation** :
- Type : Convecteurs électriques
- Âge : 15 ans
- Consommation : 10,000 kWh/an
- Prix électricité : 0.21 €/kWh

**Calcul du rendement** :
- Rendement électrique : **1.0 (100%)**

**Demande de chaleur** :
```
Chaleur = 10,000 × 1.0 = 10,000 kWh/an
```

**Avec PAC Air/Eau (COP 2.9)** :
```
Conso_PAC = 10,000 / 2.9 = 3,448 kWh élec/an
```

**Coûts annuels** :
- Électrique actuel : 10,000 × 0.21 = **2,100 €/an**
- PAC : 3,448 × 0.21 = **724 €/an**
- **Économies : 1,376 €/an** (66% de réduction)

**Conclusion** : Excellent cas pour une PAC. Même si le rendement du chauffage électrique est de 100%, la PAC divise la consommation par ~3 grâce au COP.

---

## Sources et Références

### Sources Officielles Françaises

1. **ADEME (Agence de la transition écologique)**
   - Étude 2023-2024 sur les performances des pompes à chaleur
   - Facteurs de conversion énergétique
   - Données d'évolution des prix de l'énergie

2. **Ministère de la Transition Écologique**
   - Arrêté du 31 mars 2021 relatif au DPE
   - Méthode de calcul 3CL-DPE 2021
   - Documentation technique officielle

3. **DIDO-SDES (Service des Données et Études Statistiques)**
   - API des prix de l'énergie : https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1
   - Dataset : Conjoncture mensuelle de l'énergie

### Normes Européennes

1. **EN 15316** - Systèmes de chauffage et de refroidissement dans les bâtiments
   - EN 15316-4-1 : Systèmes de combustion
   - EN 15316-4-2 : Pompes à chaleur

2. **Directive 92/42/CEE** - Rendements des chaudières
   - Exigences minimales de rendement

3. **Règlement (UE) 813/2013** - Exigences d'écoconception (ErP)
   - Obligations pour les chaudières neuves

### Études Internationales

1. **UK Energy Saving Trust**
   - Field trial of 40 condensing boilers (2012)
   - Real-world performance vs rated efficiency

2. **SEDBUK (UK)**
   - Seasonal Efficiency of Domestic Boilers in UK
   - Méthodologie de calcul du rendement saisonnier

3. **NREL (National Renewable Energy Laboratory, USA)**
   - Études sur le remplacement de chaudières par PAC
   - Données de performance réelle

### Publications Académiques

1. ResearchGate - "Real-time monitoring energy efficiency and performance degradation of condensing boilers"
2. ScienceDirect - "Experimental evaluation of seasonal efficiency of condensing boilers"
3. MDPI - "European Efficiency Schemes for Domestic Gas Boilers"

---

## Validation et Conformité

### Alignement avec le DPE 2021

ThermoGain utilise des coefficients et méthodes conformes au DPE 3CL-DPE 2021 pour :
- Les rendements par défaut selon l'année d'installation
- Les facteurs de dégradation liés à l'âge
- Les contenus énergétiques des combustibles

### Conformité ADEME

- Utilisation des valeurs de COP réelles (2.9 pour PAC Air/Eau)
- Facteurs de conversion énergétique validés
- Prix de l'énergie actualisés mensuellement via source officielle

### Conformité Européenne EN 15316

- Méthodologie de calcul des rendements saisonniers
- Prise en compte des dégradations dans le temps
- Distinction condensation / standard

---

## Limites et Améliorations Futures

### Limites Actuelles

1. **COP constant** : Pas de modélisation de la variation du COP selon la température extérieure
2. **Eau chaude sanitaire** : Non prise en compte dans les calculs actuels
3. **Émetteurs de chaleur** : Impact des radiateurs vs plancher chauffant non modélisé

### Améliorations Envisagées

1. **COP dynamique** : Courbe de COP en fonction de la température extérieure
2. **Dimensionnement de la PAC** : Calcul automatique de la puissance nécessaire
3. **Simulation annuelle** : Calcul mois par mois avec températures réelles
4. **Coût complet** : Intégration de l'abonnement électricité, maintenance, etc.

---

## Contact et Contributions

Pour toute question sur les méthodes de calcul ou suggestion d'amélioration :
- Ouvrir une issue sur le dépôt GitHub
- Consulter la documentation technique des modules concernés

**Date de dernière mise à jour** : Novembre 2024

**Version** : 1.0
