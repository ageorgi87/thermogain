# Barèmes d'Abonnements et Coûts Fixes Énergétiques

## 📋 Vue d'ensemble

Ce module (`lib/subscriptionRates.ts`) centralise tous les barèmes tarifaires et coûts fixes liés aux systèmes de chauffage en France. Il constitue une **base de données de référence** pour les calculs de rentabilité des pompes à chaleur (PAC).

**Fichier concerné :** `lib/subscriptionRates.ts`

**Dernière mise à jour :** Novembre 2024

---

## 🎯 Objectif

Intégrer les **coûts fixes** (abonnements et entretiens) dans le calcul de rentabilité des PAC, car ils représentent une part significative du coût total annuel d'un système de chauffage (15-25% du coût total).

**Problématique initiale :**
Les calculs ne prenaient en compte que les coûts variables (consommation × prix unitaire), ignorant :
- Les abonnements électricité et gaz (150-300 €/an)
- Les coûts d'entretien obligatoires (80-150 €/an)
- L'augmentation de puissance souscrite nécessaire pour une PAC (+40-60 €/an)

**Solution :**
Créer un module centralisé avec tous les barèmes officiels 2024 pour calculer précisément les coûts fixes.

---

## 📊 Données Incluses

### 1. Abonnements Électricité (Tarif Réglementé EDF)

| Puissance | Abonnement annuel TTC | Usage typique |
|-----------|----------------------|---------------|
| **3 kVA** | 115 €/an (~9.60 €/mois) | Studio, très petit logement |
| **6 kVA** | 151 €/an (~12.60 €/mois) | ⭐ Logement standard sans chauffage électrique |
| **9 kVA** | 189 €/an (~15.75 €/mois) | Logement avec PAC ou chauffage électrique |
| **12 kVA** | 228 €/an (~19.00 €/mois) | Grande maison avec PAC puissante |
| **15 kVA** | 264 €/an (~22.00 €/mois) | Très grande maison |
| **18 kVA** | 301 €/an (~25.08 €/mois) | Usage professionnel ou très grande maison |

**Source :** EDF Tarif Bleu - Novembre 2024
**Composition du tarif :**
- Part acheminement (TURPE): ~50% du total
- Contribution Service Public Électricité (CSPE): ~10%
- Contribution Tarifaire Acheminement (CTA): ~3%
- TVA 5.5% sur abonnement

**🔗 Référence officielle :**
https://particulier.edf.fr/fr/accueil/gestion-contrat/options/tarif-reglemente.html

---

### 2. Abonnement Gaz Naturel (Tarif Réglementé Engie)

**Valeur moyenne : 120 €/an** (~10 €/mois)

**Barème détaillé selon consommation :**

| Tranche | Consommation annuelle | Abonnement TTC | Usage |
|---------|----------------------|----------------|-------|
| **Base** | 0 - 1000 kWh/an | 103 €/an | Eau chaude uniquement |
| **B0** | 1000 - 6000 kWh/an | 120 €/an | Eau chaude + cuisson |
| **B1** | 6000 - 30000 kWh/an | 120 €/an | ⭐ Chauffage petit/moyen logement |
| **B2i** | 30000 - 300000 kWh/an | 267 €/an | Chauffage grand logement/collectif |

**Source :** Engie Tarif Réglementé - Novembre 2024
**Composition du tarif :**
- Part acheminement (ATRD): ~40% du total
- Taxe Intérieure Consommation Gaz Naturel (TICGN): ~25%
- Contribution Tarifaire Acheminement (CTA): ~5%
- TVA 5.5% sur abonnement

**🔗 Référence officielle :**
https://particuliers.engie.fr/gaz-naturel/tarifs-gaz.html

---

### 3. Coûts d'Entretien Annuels Moyens

| Type de chauffage | Coût moyen | Obligation légale | Détails |
|-------------------|------------|-------------------|---------|
| **Gaz** | 120 €/an | ✅ Obligatoire annuel | Ramonage, nettoyage brûleur, contrôle combustion |
| **Fioul** | 150 €/an | ✅ Obligatoire annuel | Ramonage obligatoire, nettoyage complet |
| **GPL** | 130 €/an | ✅ Obligatoire annuel | Similaire gaz + spécificités GPL |
| **Pellets** | 100 €/an | ⚠️ Recommandé annuel | Nettoyage, ramonage |
| **Bois** | 80 €/an | ⚠️ Ramonage 2×/an | Ramonage conduit (obligatoire 2×/an si usage principal) |
| **Électricité** | 0 €/an | ❌ Aucun | Pas d'entretien pour chauffage direct |
| **PAC** | 120 €/an | ⚠️ Obligatoire tous les 2 ans | Contrôle étanchéité, fluide frigorigène, filtres |

**📜 Cadre légal :**
- **Décret n°2009-649** : Obligation d'entretien annuel des chaudières gaz/fioul
- **Décret n°2020-912** : Contrôle obligatoire PAC tous les 2 ans (charge >2kg fluide)
- **Règlement sanitaire départemental** : Ramonage cheminée/conduit 2×/an

**Sources :**
- ADEME (Agence de la Transition Écologique)
- Syndicats professionnels (CAPEB, FFB)
- Moyennes marché 2024

**💰 Composition du coût d'entretien (exemple chaudière gaz) :**
```
Main d'œuvre technicien qualifié : 80-100 €
Ramonage conduit : 30-40 €
Nettoyage brûleur/échangeur : 10-20 €
Réglages et contrôles : 10-15 €
Attestation d'entretien : inclus
──────────────────────────────────
TOTAL MOYEN : 120 €
```

---

## 🔬 Méthodologie de Calcul

### Calcul Ancien Système de Chauffage

```typescript
Coût fixe annuel ancien système =
  Abonnement électricité actuel
  + Abonnement gaz (si Gaz)
  + Entretien selon type
```

**Exemples concrets :**

#### Exemple 1 : Chaudière Gaz
```
Abonnement électricité : 151 €/an (6 kVA)
Abonnement gaz : 120 €/an
Entretien chaudière : 120 €/an
────────────────────────────────
TOTAL COÛTS FIXES : 391 €/an
```

#### Exemple 2 : Chaudière Fioul
```
Abonnement électricité : 151 €/an (6 kVA)
Abonnement gaz : 0 €/an
Entretien chaudière : 150 €/an
────────────────────────────────
TOTAL COÛTS FIXES : 301 €/an
```

#### Exemple 3 : Poêle à Pellets
```
Abonnement électricité : 151 €/an (6 kVA)
Abonnement gaz : 0 €/an
Entretien poêle : 100 €/an
────────────────────────────────
TOTAL COÛTS FIXES : 251 €/an
```

---

### Calcul Pompe à Chaleur

```typescript
Coût fixe annuel PAC =
  Abonnement électricité PAC (puissance supérieure)
  + Entretien PAC
```

**Exemple concret : PAC Air/Eau 8 kW**

```
Puissance recommandée : 9 kVA
Abonnement électricité : 189 €/an (9 kVA)
Entretien PAC : 120 €/an
────────────────────────────────
TOTAL COÛTS FIXES : 309 €/an
```

---

### Détermination Puissance Souscrite PAC

**Formule théorique :**
```
Puissance recommandée = (Puissance PAC × 1.2) + 3 kVA
```

**Raisons :**
1. **Puissance PAC × 1.2** : Marge de sécurité 20% pour pic de démarrage compresseur
2. **+ 3 kVA** : Base pour autres équipements du logement (frigo, plaques, four, etc.)
3. **Ne jamais descendre** en dessous de la puissance actuelle

**Table de correspondance :**

| Puissance PAC | Calcul théorique | Puissance recommandée |
|---------------|------------------|-----------------------|
| 3-4 kW | (4 × 1.2) + 3 = 7.8 kVA | **9 kVA** |
| 5-6 kW | (6 × 1.2) + 3 = 10.2 kVA | **12 kVA** |
| 7-8 kW | (8 × 1.2) + 3 = 12.6 kVA | **12 kVA** |
| 9-10 kW | (10 × 1.2) + 3 = 15 kVA | **15 kVA** |
| 11-13 kW | (13 × 1.2) + 3 = 18.6 kVA | **18 kVA** |

**💡 Note importante :**
La plupart des PAC résidentielles (5-8 kW) nécessitent une puissance de **9 kVA**, soit une augmentation typique de **+38 €/an** par rapport à un abonnement 6 kVA standard.

---

## 💰 Impact Financier Réel

### Comparaison Chaudière Gaz → PAC

**Configuration :**
- Ancien système : Chaudière gaz, 6 kVA
- Nouveau système : PAC Air/Eau 8 kW, 9 kVA

**Coûts fixes :**

| Poste | Ancien (Gaz) | Nouveau (PAC) | Delta |
|-------|--------------|---------------|-------|
| Abonnement électricité | 151 €/an | 189 €/an | **+38 €/an** |
| Abonnement gaz | 120 €/an | 0 €/an | **-120 €/an** |
| Entretien | 120 €/an | 120 €/an | 0 €/an |
| **TOTAL** | **391 €/an** | **309 €/an** | **-82 €/an** ✅ |

**💡 Résultat :** Économie de 82 €/an sur les coûts fixes grâce à la suppression de l'abonnement gaz.

---

### Comparaison Chaudière Fioul → PAC

**Configuration :**
- Ancien système : Chaudière fioul, 6 kVA
- Nouveau système : PAC Air/Eau 8 kW, 9 kVA

**Coûts fixes :**

| Poste | Ancien (Fioul) | Nouveau (PAC) | Delta |
|-------|----------------|---------------|-------|
| Abonnement électricité | 151 €/an | 189 €/an | **+38 €/an** |
| Abonnement gaz | 0 €/an | 0 €/an | 0 €/an |
| Entretien | 150 €/an | 120 €/an | **-30 €/an** ✅ |
| **TOTAL** | **301 €/an** | **309 €/an** | **+8 €/an** ⚠️ |

**💡 Résultat :** Légère augmentation de 8 €/an sur les coûts fixes, largement compensée par les économies sur la consommation.

---

## 📝 Fonctions Disponibles

### 1. `getAbonnementElectriciteAnnuel(puissanceKva)`

Récupère le coût d'abonnement électrique annuel.

```typescript
const abonnement6kva = getAbonnementElectriciteAnnuel(6)
// Retourne: 151
```

---

### 2. `getDeltaAbonnementElectricite(puissanceActuelle, puissancePac)`

Calcule la différence d'abonnement électrique.

```typescript
const delta = getDeltaAbonnementElectricite(6, 9)
// Retourne: 38 (189 - 151 = +38 €/an)
```

---

### 3. `getEntretienAnnuelMoyen(typeChauffage)`

Récupère le coût d'entretien moyen.

```typescript
const entretienGaz = getEntretienAnnuelMoyen("Gaz")
// Retourne: 120
```

---

### 4. `getPuissanceSouscritePacRecommandee(puissancePacKw, puissanceActuelleKva)`

Détermine la puissance recommandée pour la PAC.

```typescript
const puissanceReco = getPuissanceSouscritePacRecommandee(8, 6)
// Retourne: 9 (PAC 8kW nécessite 9 kVA minimum)
```

---

### 5. `analyseImpactCoutsFixes(...)`

Analyse complète de l'impact financier.

```typescript
const analyse = analyseImpactCoutsFixes(
  "Gaz",     // Type chauffage actuel
  6,         // Puissance actuelle kVA
  120,       // Abonnement gaz actuel
  9,         // Puissance PAC kVA
  120        // Entretien PAC
)

// Retourne:
{
  ancien: {
    abonnementElec: 151,
    abonnementGaz: 120,
    entretien: 120,
    total: 391
  },
  pac: {
    abonnementElec: 189,
    entretien: 120,
    total: 309
  },
  delta: {
    abonnementElec: 38,      // Augmentation abonnement élec
    abonnementGaz: -120,     // Suppression abonnement gaz
    entretien: 0,            // Pas de changement
    total: -82               // Économie totale
  }
}
```

---

## 🔍 Sources Officielles

### Électricité

1. **EDF - Tarifs Réglementés**
   - URL : https://particulier.edf.fr/fr/accueil/gestion-contrat/options/tarif-reglemente.html
   - Mise à jour : Mensuelle
   - Validité : Tarifs TTC applicables en France métropolitaine

2. **CRE - Commission de Régulation de l'Énergie**
   - URL : https://www.cre.fr/
   - Grille tarifaire TURPE (acheminement)
   - Évolution des tarifs réglementés

3. **Enedis - Gestionnaire Réseau**
   - URL : https://www.enedis.fr/
   - Informations techniques puissance souscrite
   - Guide changement de puissance

### Gaz

1. **Engie - Tarifs Réglementés**
   - URL : https://particuliers.engie.fr/gaz-naturel/tarifs-gaz.html
   - Mise à jour : Mensuelle
   - Barèmes selon tranches de consommation

2. **CRE - Tarifs Gaz**
   - URL : https://www.cre.fr/Gaz-naturel/tarifs-reglementes-du-gaz
   - Évolution historique des tarifs
   - Composition détaillée des prix

3. **GRDF - Gestionnaire Réseau**
   - URL : https://www.grdf.fr/
   - Tarifs acheminement (ATRD)
   - Guide raccordement et abonnement

### Entretien

1. **ADEME - Agence de la Transition Écologique**
   - URL : https://www.ademe.fr/
   - Guides entretien chaudières
   - Coûts moyens constatés

2. **Ministère de la Transition Écologique**
   - Décret n°2009-649 : Entretien chaudières
   - Décret n°2020-912 : Contrôle installations climatisation/PAC
   - Règlement sanitaire départemental

3. **Syndicats Professionnels**
   - CAPEB (Confédération de l'Artisanat et des Petites Entreprises du Bâtiment)
   - FFB (Fédération Française du Bâtiment)
   - Barèmes indicatifs prestations

---

## ⚠️ Limites et Précisions

### 1. Tarifs Applicables

**✅ Tarifs Réglementés EDF/Engie :**
- Applicables uniquement aux clients au tarif réglementé
- Environ 25% des foyers français (données CRE 2024)
- Protégés contre variations brutales

**❌ Offres de Marché :**
- Fournisseurs alternatifs (Total Energies, Eni, Vattenfall, etc.)
- Tarifs variables selon contrats
- Peuvent être 10-30% moins chers ou plus chers

**💡 Recommandation :**
Utiliser les tarifs réglementés comme **référence moyenne** pour les calculs, car ils représentent un bon équilibre et sont régulés par l'État.

---

### 2. Variations Régionales

**Électricité :**
- Tarifs identiques France métropolitaine
- Tarifs spécifiques DOM-TOM (TURPE différent)
- Acheminement variable selon gestionnaire local (rare)

**Gaz :**
- Variations selon zone tarifaire (6 zones en France)
- Écart maximal : ~5% entre zones
- Notre barème : moyenne nationale

---

### 3. Évolution des Tarifs

**Historique récent (2020-2024) :**
- **Électricité** : +40% sur 4 ans (bouclier tarifaire 2022-2024)
- **Gaz** : +60% sur 4 ans (crise énergétique 2022)
- **Entretien** : +3-5%/an (inflation)

**Prévisions 2025-2030 :**
- Fin progressive bouclier tarifaire
- Augmentation modérée prévue (+3-5%/an)
- Incertitude liée contexte géopolitique

**💡 Notre approche :**
Utiliser les tarifs **novembre 2024** comme base, avec évolutions séparées dans le module `didoApi.ts`.

---

### 4. Cas Particuliers

**Tarif Heures Pleines / Heures Creuses :**
- Abonnement ~10% plus cher que Base
- Non pris en compte dans nos calculs (simplification)
- À intégrer si usage intensif nuit (chauffe-eau, PAC pilotée)

**Tarif Tempo / EJP :**
- Abonnements spécifiques
- Forte variabilité selon jours
- Non applicable pour PAC (besoin chauffage quotidien)

**Habitat Collectif :**
- Abonnements mutualisés possibles
- Tarifs négociés avec syndic
- Nos barèmes = logement individuel

---

## 📚 Exemples d'Utilisation dans le Code

### Cas d'usage 1 : Calculer coût fixe ancien système

```typescript
import {
  getAbonnementElectriciteAnnuel,
  getEntretienAnnuelMoyen
} from '@/lib/subscriptionRates'

// Chaudière gaz, 6 kVA
const abonnementElec = getAbonnementElectriciteAnnuel(6)      // 151 €
const abonnementGaz = 120                                      // 120 €
const entretien = getEntretienAnnuelMoyen("Gaz")              // 120 €

const coutFixeTotal = abonnementElec + abonnementGaz + entretien
console.log(`Coût fixe total : ${coutFixeTotal} €/an`)
// Affiche: "Coût fixe total : 391 €/an"
```

---

### Cas d'usage 2 : Déterminer puissance PAC recommandée

```typescript
import { getPuissanceSouscritePacRecommandee } from '@/lib/subscriptionRates'

// PAC 8 kW, puissance actuelle 6 kVA
const puissanceReco = getPuissanceSouscritePacRecommandee(8, 6)
console.log(`Puissance recommandée : ${puissanceReco} kVA`)
// Affiche: "Puissance recommandée : 9 kVA"
```

---

### Cas d'usage 3 : Analyse complète impact financier

```typescript
import { analyseImpactCoutsFixes } from '@/lib/subscriptionRates'

const analyse = analyseImpactCoutsFixes(
  "Gaz",  // Type actuel
  6,      // Puissance actuelle
  120,    // Abonnement gaz
  9,      // Puissance PAC
  120     // Entretien PAC
)

console.log("=== ANALYSE IMPACT COÛTS FIXES ===")
console.log(`Ancien système : ${analyse.ancien.total} €/an`)
console.log(`PAC : ${analyse.pac.total} €/an`)
console.log(`Économie : ${-analyse.delta.total} €/an`)

// Affiche:
// === ANALYSE IMPACT COÛTS FIXES ===
// Ancien système : 391 €/an
// PAC : 309 €/an
// Économie : 82 €/an
```

---

## 🔄 Intégration avec les Modules de Calcul

### Module `currentCost.ts`

**Avant :**
```typescript
Coût annuel = Consommation × Prix unitaire
```

**Après :**
```typescript
import { getCoutFixeAncienSysteme } from '@/lib/subscriptionRates'

const coutVariable = consommation × prixUnitaire
const coutFixe = getCoutFixeAncienSysteme(
  typeChauffage,
  puissanceElecActuelle,
  abonnementGaz
)

Coût annuel total = coutVariable + coutFixe.total
```

---

### Module `pacCost.ts`

**Avant :**
```typescript
Coût annuel PAC = Consommation PAC × Prix électricité
```

**Après :**
```typescript
import { getCoutFixePac } from '@/lib/subscriptionRates'

const coutVariable = consommationPac × prixElectricite
const coutFixe = getCoutFixePac(puissancePacKva, entretienPac)

Coût annuel PAC total = coutVariable + coutFixe.total
```

---

## 📊 Impact sur les Résultats

### Exemple Concret : Remplacement Gaz → PAC

**Hypothèses :**
- Consommation gaz : 15000 kWh/an
- Prix gaz : 0.10 €/kWh
- COP PAC : 3.0
- Prix électricité : 0.21 €/kWh

**SANS prise en compte coûts fixes :**

```
Ancien (Gaz) : 15000 × 0.10 = 1500 €/an
PAC : (15000/3.0) × 0.21 = 1050 €/an
────────────────────────────────────────
Économie apparente : 450 €/an
```

**AVEC prise en compte coûts fixes :**

```
Ancien (Gaz) :
  Consommation : 1500 €/an
  Abonnement élec : 151 €/an
  Abonnement gaz : 120 €/an
  Entretien : 120 €/an
  ─────────────────────────
  TOTAL : 1891 €/an

PAC :
  Consommation : 1050 €/an
  Abonnement élec : 189 €/an
  Entretien : 120 €/an
  ─────────────────────────
  TOTAL : 1359 €/an

────────────────────────────────────────
Économie réelle : 532 €/an (+18% vs calcul simplifié)
```

**💡 Constat :**
La prise en compte des coûts fixes **améliore** le résultat car la suppression de l'abonnement gaz (+120 €/an) compense largement l'augmentation de l'abonnement électrique (+38 €/an).

---

## 🎓 Glossaire

| Terme | Définition |
|-------|------------|
| **kVA** | Kilovoltampère - Unité de puissance apparente électrique. En résidentiel, équivaut approximativement à kW. |
| **TURPE** | Tarif d'Utilisation des Réseaux Publics d'Électricité - Couvre l'acheminement de l'électricité du producteur au consommateur. |
| **ATRD** | Accès des Tiers aux Réseaux de Distribution - Couvre l'acheminement du gaz. |
| **CSPE** | Contribution au Service Public de l'Électricité - Taxe finançant les énergies renouvelables et la solidarité tarifaire. |
| **TICGN** | Taxe Intérieure de Consommation sur le Gaz Naturel - Taxe sur la consommation de gaz. |
| **CTA** | Contribution Tarifaire d'Acheminement - Finance les régimes sociaux des industries électriques et gazières. |
| **Fluide frigorigène** | Fluide utilisé dans les PAC pour transférer la chaleur (R32, R410A, etc.). Contrôle obligatoire si charge >2kg. |

---

**Dernière mise à jour :** 28 novembre 2024
**Version :** 1.0
**Auteur :** ThermoGain
**Conformité :** Tarifs EDF/Engie novembre 2024, Décrets 2009-649 et 2020-912
