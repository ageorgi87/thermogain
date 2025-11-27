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
   - Évolutions historiques calculées sur toutes les données disponibles (jusqu'à 42 ans)
   - Pondération 70% sur les 10 dernières années, 30% sur l'historique complet
   - Source : https://data.statistiques.developpement-durable.gouv.fr/

4. **Normes européennes EN 15316**
   - Méthodologie de calcul des rendements saisonniers
   - Performance des systèmes de chauffage

### Principes Clés

1. **Rendement réel des chaudières** : Prise en compte de l'âge et de l'entretien (58-92% selon cas)
2. **COP ajusté** : Ajustement selon température départ, émetteurs, et zone climatique
3. **Zones climatiques** : 8 zones H1a à H3 (±30% de variation Nord ↔ Sud)
4. **Évolution des prix** : Projections calculées sur données historiques réelles de l'API DIDO-SDES
   - Fioul : +7.2%/an (42 ans de données)
   - Gaz : +8.7%/an (18 ans de données)
   - GPL : +7.2%/an (42 ans de données)
   - Bois : +3.4%/an (18 ans de données)
   - Électricité : +6.9%/an (18 ans de données)

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
- [x] ~~Dimensionnement automatique de la puissance PAC~~ → **Implémenté !** Voir `@/lib/copAdjustments`
- [ ] Simulation mois par mois avec températures réelles

## ✅ Améliorations Récentes (Novembre 2024)

### 1. Validation du dimensionnement PAC améliorée

La fonction `validatePacPower()` du module `@/lib/copAdjustments` a été améliorée pour prendre en compte :

1. **Qualité d'isolation réelle** (`qualiteIsolation`: Bonne/Moyenne/Mauvaise)
   - Plus précis que l'année de construction seule
   - Permet de valider correctement les maisons rénovées
   - Coefficients : 45-80 W/m² selon qualité

2. **Zone climatique** (déduite du `code_postal`)
   - Ajustement selon les DJU (Degrés-Jours Unifiés)
   - Variation de -27% (Marseille) à +36% (montagne) vs référence
   - Évite sous/sur-dimensionnement selon climat

3. **Message de validation détaillé**
   - Mentionne explicitement l'isolation et la zone climatique
   - Transparence et pédagogie pour l'utilisateur
   - Exemple : "⚠️ Puissance potentiellement insuffisante pour 100 m² avec isolation moyenne en zone H1b (Alsace). Recommandé : 6.6-8.9 kW"

**Impact :** Validation beaucoup plus précise du dimensionnement, évite surcoûts et inconfort.

**Documentation complète :** Voir `lib/copAdjustments.README.md`

### 2. Unification des inputs numériques du wizard

Tous les champs numériques du wizard (étapes 1-7) utilisent désormais un **pattern unifié** pour une expérience utilisateur cohérente :

**Changements appliqués :**
1. **Pattern de field spreading** : `{...field}` + override du `onChange` avec `Number(e.target.value)`
2. **Schémas Zod** : Remplacement de `.optional()` par `.default(0)` pour tous les champs numériques optionnels
3. **Auto-calculs** : Placement correct des `form.watch()` AVANT les `useEffect` pour éviter les erreurs de dépendances
4. **Validation conditionnelle** : Vérification de changement avant `setValue()` pour éviter les boucles infinies

**Avantages utilisateur :**
- ✅ Suppression complète des valeurs possible
- ✅ Saisie de `0` explicite sans réinitialisation
- ✅ Pas de "04" lors de la saisie dans un champ vide
- ✅ Comportement cohérent dans toute l'application

**Fichiers modifiés :**
- `sections/costs/costsFields.tsx` - 3 champs (coût PAC, installation, travaux)
- `sections/financialAid/financialAidFields.tsx` - 3 champs (MaPrimeRénov', CEE, autres aides)
- `sections/financing/financingFields.tsx` - 2 champs + fix auto-calcul crédit
- `sections/housing/housingFields.tsx` - 1 champ (nombre occupants)
- `sections/heatPumpProject/heatPumpProjectFields.tsx` - 3 champs (puissance, COP, durée de vie)
- `sections/evolutions/evolutionsFields.tsx` - 5 champs (évolutions prix énergies)
- `sections/evolutions/evolutionsSchema.ts` - Tous les champs passés de `.optional()` à `.default(0)`

**Exemple de code :**
```typescript
// Avant (problématique)
<Input
  type="number"
  value={field.value === 0 ? "" : field.value}
  onChange={(e) => {
    const value = e.target.value === "" ? 0 : Number(e.target.value)
    field.onChange(value)
  }}
  onBlur={field.onBlur}
  name={field.name}
  ref={field.ref}
/>

// Après (unifié et simple)
<Input
  type="number"
  {...field}
  onChange={(e) => field.onChange(Number(e.target.value))}
/>
```

**Documentation complète :** Voir section "Patterns d'Implémentation" dans le README principal

### 5. Amélioration du système d'évolution des prix énergétiques (Novembre 2024)

Le calcul des taux d'évolution des prix de l'énergie a été entièrement revu pour utiliser les données historiques réelles de l'API DIDO-SDES :

**Changements majeurs :**

1. **Utilisation maximale des données disponibles**
   - Avant : Calcul fixe sur 10 ans (ou échec si <120 mois de données)
   - Après : Utilisation de TOUTES les données disponibles (jusqu'à 42 ans pour le fioul)
   - Minimum : 24 mois (2 ans) pour avoir des moyennes glissantes valides

2. **Pondération 70/30 sur 10 dernières années**
   - 70% du poids sur l'évolution des 10 dernières années
   - 30% du poids sur l'évolution long terme (toute la période disponible)
   - Raison : Donner plus d'importance aux tendances récentes tout en lissant les variations

3. **Calcul avec moyennes glissantes**
   - Prix récent = moyenne des 12 derniers mois
   - Prix ancien = moyenne des 12 premiers mois de la période
   - Évolution annualisée = (évolution totale / nombre d'années)

4. **Résultats réels actuels :**
   ```
   Fioul : 7.2%/an (514 mois = 42.8 ans de données)
   Gaz : 8.7%/an (222 mois = 18.5 ans)
   GPL : 7.2%/an (514 mois = 42.8 ans, même source que fioul)
   Bois : 3.4%/an (222 mois = 18.5 ans)
   Électricité : 6.9%/an (222 mois = 18.5 ans)
   ```

5. **Affichage dans l'interface**
   - Tooltips affichent les valeurs de l'API avec 2 décimales (ex: +7.20%/an)
   - Les valeurs sont distinctes des champs de formulaire (valeur API vs valeur utilisateur)
   - Date de dernière mise à jour affichée dans le tooltip

6. **Système de cache mensuel**
   - Les valeurs sont mises en cache dans la table `energyPriceCache`
   - Validation automatique : cache valide pendant le mois en cours
   - Rechargement automatique depuis l'API si cache expiré
   - Transparence : logs détaillés du calcul (période, moyennes, évolutions)

**Impact :**
- ✅ Projections plus réalistes basées sur l'historique complet
- ✅ Prise en compte des tendances récentes (pondération 70%)
- ✅ Évite les biais liés aux périodes courtes
- ✅ Mise à jour automatique mensuelle depuis l'API

**Modules impactés :**
- `lib/didoApi.ts` - Calcul pondéré avec toutes les données disponibles
- `lib/energyPriceCache.ts` - Système de cache avec validation mensuelle
- `app/(main)/projects/[projectId]/[step]/sections/evolutions/evolutionsActions.ts` - Récupération des valeurs de l'API
- `app/(main)/projects/[projectId]/[step]/sections/evolutions/evolutionsFields.tsx` - Affichage des valeurs dans les tooltips avec 2 décimales

**Exemple de calcul (Fioul) :**
```
📊 Données disponibles : 514 mois (42.8 ans)
📈 Évolution long terme : 4.38%/an
📈 Évolution 10 dernières années : 8.45%/an
🎯 Évolution pondérée finale : (4.38 × 0.3) + (8.45 × 0.7) = 7.23%/an → 7.2%/an
   Prix en 1982 : 3.99 €/100kWh
   Prix en 2024 : 11.47 €/100kWh
```

### 3. Amélioration du calculateur d'aides

Le composant `AidCalculator` a été simplifié :
- Suppression du texte explicatif "(MaPrimeRénov' + CEE)" du bouton déclencheur
- Interface plus épurée et professionnelle
- Logique de calcul inchangée (toujours basée sur les fonctions officielles)

### 4. Correction du calcul du ROI avec prise en compte des intérêts du crédit

Le calcul du ROI (Retour sur Investissement) a été corrigé pour refléter le coût réel selon le mode de financement :

**Problème identifié :**
- Auparavant, le ROI était toujours calculé avec le `reste_a_charge` (montant après aides)
- Les intérêts du crédit n'étaient PAS pris en compte
- → Le ROI était sous-estimé pour les modes "Crédit" et "Mixte"

**Solution implémentée :**
La fonction `calculateAllResults()` calcule maintenant l'investissement réel selon le mode :

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
- **Cohérence** : aligné avec le graphique des coûts cumulés qui affiche les mensualités
- **Transparence** : l'utilisateur voit le vrai temps nécessaire pour rentabiliser

**Exemple concret :**
```
Reste à charge : 12 000 €
Mode : Crédit sur 5 ans à 3%

Avant correction :
- ROI calculé avec : 12 000 €
- ROI affiché : ~7 ans (❌ sous-estimé)

Après correction :
- Coût total crédit : 12 957 € (capital + intérêts)
- ROI calculé avec : 12 957 €
- ROI affiché : ~7.5 ans (✅ correct)
```

**Modules impactés :**
- `calculations/index.ts` - Ajustement de l'investissement selon le mode de financement
- `calculations/roi/README.md` - Mise à jour de la documentation

## 📞 Support

Pour toute question technique sur les calculs :
1. Consultez le README du module concerné
2. Ouvrez une issue sur le dépôt GitHub
3. Consultez les sources officielles listées dans chaque module

---

**Dernière mise à jour** : 27 novembre 2024
**Version** : 1.3
**Conformité** : DPE 3CL-DPE 2021, ADEME, EN 15316, RT2012, API DIDO-SDES
