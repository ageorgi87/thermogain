# Résumé Exécutif - Modèles d'Évolution des Prix de l'Énergie

## 🎯 Problème identifié

Le modèle actuel (linéaire constant à 8,7%/an pour le gaz) **surestime le bénéfice de 39,4%** en projetant les taux de crise récents sur toute la durée de vie du projet (17 ans).

### Résultats comparatifs - Projet test

| Métrique | Modèle actuel | Mean Reversion | Différence |
|----------|---------------|----------------|------------|
| **Bénéfice net** | **45 134 €** | **27 363 €** | **-17 770 €** (-39,4%) |
| Coût gaz total (17 ans) | 107 368 € | 79 256 € | -28 112 € |
| Coût PAC total (17 ans) | 50 367 € | 40 025 € | -10 342 € |
| Économies totales | 57 001 € | 39 230 € | -17 770 € |

### Visualisation de l'évolution des taux - Gaz

```
Année    Linéaire    Mean Reversion    Dampening
  1        8,7%          8,7%              8,7%
  5        8,7%          4,5%              6,4%
 10        8,7%          3,5%              4,8%
 17        8,7%          3,5%              4,0%
```

**Observation** : Le modèle actuel applique le taux de crise sur TOUTE la période, alors que Mean Reversion converge vers un taux d'équilibre réaliste.

---

## ✅ Solution recommandée : Mean Reversion

### Principe

Les prix de l'énergie reviennent progressivement vers un **niveau d'équilibre** déterminé par les coûts de production et la demande. Les crises créent des pics temporaires, mais le marché se normalise sur le long terme.

### Implémentation proposée

**Gaz** :
- Années 1-5 : Transition linéaire de 8,7% → 3,5%
- Années 6-17 : Taux stabilisé à 3,5%

**Électricité** :
- Années 1-5 : Transition linéaire de 6,9% → 2,5%
- Années 6-17 : Taux stabilisé à 2,5%

### Justification du taux d'équilibre

**Gaz : 3,5%/an**
- Inflation moyenne : 2%
- Croissance structurelle demande : 1,5%
- Total : 3,5%

**Électricité : 2,5%/an**
- Inflation moyenne : 2%
- Baisse structurelle due aux ENR : -0,5%
- Décarbonation progressive : -0,5%
- Croissance demande (mobilité, chaleur) : +1,5%
- Total : 2,5%

---

## 📊 Impact sur les projections

### Coût du gaz sur 17 ans (20 000 kWh/an)

| Année | Modèle actuel | Mean Reversion | Écart |
|-------|---------------|----------------|-------|
| 1 | 3 191 € | 3 191 € | 0 € |
| 5 | 4 414 € | 3 886 € | -528 € |
| 10 | 6 905 € | 4 738 € | -2 167 € |
| 17 | 11 028 € | 6 021 € | -5 007 € |

**Multiplicateur sur 17 ans** :
- Modèle actuel : ×3,46 (prix triplé !)
- Mean Reversion : ×1,89 (prix doublé)

### Répartition des économies

Sur 17 ans, les économies proviennent de :

**Modèle actuel (57 001 €)** :
- Économies réelles : ~39 000 €
- Surestimation due aux taux de crise : ~18 000 €

**Mean Reversion (39 230 €)** :
- Économies réalistes basées sur retour à l'équilibre

---

## 🔬 Fondements scientifiques

### Recherches consultées

1. **Mean Reversion** : Modèle d'Ornstein-Uhlenbeck
   - Source : Lucia & Schwartz (2002), "Electricity prices and power derivatives"
   - Les prix énergétiques gravitent vers un équilibre long-terme

2. **Exponential Smoothing** : Holt-Winters
   - Source : Weron (2014), "Electricity price forecasting"
   - Observations anciennes reçoivent des poids décroissants

3. **Dampening** : Amortissement des chocs
   - Source : JRC EU (2025), "Tackling energy price volatility"
   - Réduction progressive de l'impact des crises récentes

### Observations empiriques

- Les marchés énergétiques montrent des **cycles de 19-19,5 ans**
- Les **spikes de prix** reviennent très rapidement vers le niveau d'origine
- La crise 2022 (Ukraine) influence le taux moyen mais n'est pas structurelle
- Les projections institutionnelles (AIE, Commission UE) utilisent des taux d'équilibre

---

## 🚀 Plan d'implémentation

### Phase 1 : Intégration du modèle Mean Reversion ⭐ PRIORITÉ

**Fichiers à modifier** :

1. **`/lib/energyPriceEvolution.ts`** ✅ CRÉÉ
   - Fonctions de calcul des taux d'évolution
   - Modèles configurables (linear, mean-reversion, dampening)
   - Utilitaires de projection

2. **`/app/(main)/projects/[projectId]/calculations/currentCost/currentCost.ts`**
   - Modifier `calculateCurrentCostForYear()` pour utiliser le nouveau modèle
   - Remplacer le calcul linéaire actuel

3. **`/app/(main)/projects/[projectId]/calculations/pacCost/pacCost.ts`**
   - Modifier `calculatePacCostForYear()` pour utiliser le nouveau modèle
   - Remplacer le calcul linéaire actuel

4. **`/app/(main)/projects/[projectId]/calculations/index.ts`**
   - Passer les modèles d'évolution aux fonctions de calcul
   - Utiliser `DEFAULT_GAS_MODEL` et `DEFAULT_ELECTRICITY_MODEL`

**Temps estimé** : 2-3 heures

### Phase 2 : Interface utilisateur (optionnel)

**Fonctionnalités** :

1. **Sélection du modèle** (page résultats)
   - Radio buttons : Linéaire / Mean Reversion / Dampening
   - Description de chaque modèle

2. **Paramètres avancés** (optionnel)
   - Ajuster le taux d'équilibre
   - Modifier la durée de transition

3. **Graphique de projection**
   - Courbe d'évolution des prix sur 17 ans
   - Comparaison gaz vs électricité

**Temps estimé** : 4-6 heures

### Phase 3 : Documentation et transparence

**À afficher sur la page de résultats** :

1. **Méthodologie** :
   ```
   💡 Projection des prix

   Les taux d'évolution des prix de l'énergie sont basés sur un modèle
   de "retour à la moyenne" qui tient compte des crises récentes tout en
   convergeant vers des taux d'équilibre réalistes à long terme.

   Gaz : 8,7% → 3,5% sur 5 ans
   Électricité : 6,9% → 2,5% sur 5 ans
   ```

2. **Hypothèses détaillées** (accordéon ou tooltip)
   - Sources des taux (API DIDO-SDES)
   - Justification des taux d'équilibre
   - Références académiques

**Temps estimé** : 1-2 heures

---

## 📋 Code d'intégration proposé

### Modification de `currentCost.ts`

```typescript
import {
  calculateCostForYear,
  DEFAULT_GAS_MODEL
} from '@/lib/energyPriceEvolution'

export function calculateCurrentCostForYear(
  data: ProjectData,
  year: number
): number {
  const variableCost = calculateCurrentVariableCost(data)
  const fixedCosts = calculateCurrentFixedCosts(data)

  // Utiliser le modèle d'évolution approprié selon le type de chauffage
  const model = data.type_chauffage === 'Gaz'
    ? DEFAULT_GAS_MODEL
    : DEFAULT_GAS_MODEL // Adapter selon le type d'énergie

  return calculateCostForYear(
    variableCost.total,
    fixedCosts.total,
    year,
    model
  )
}
```

### Modification de `pacCost.ts`

```typescript
import {
  calculateCostForYear,
  DEFAULT_ELECTRICITY_MODEL
} from '@/lib/energyPriceEvolution'

export function calculatePacCostForYear(
  data: ProjectData,
  year: number
): number {
  const variableCost = calculatePacVariableCost(data)
  const fixedCosts = calculatePacFixedCosts(data)

  return calculateCostForYear(
    variableCost,
    fixedCosts.total,
    year,
    DEFAULT_ELECTRICITY_MODEL
  )
}
```

---

## ⚠️ Impacts attendus

### Sur les bénéfices calculés

- **Réduction moyenne : -30% à -40%** du bénéfice net affiché
- Les projets restent **largement rentables** mais avec des projections plus réalistes
- Meilleure **crédibilité** auprès des clients et partenaires

### Sur l'expérience utilisateur

**Positif** :
- Projections plus crédibles et défendables
- Transparence sur la méthodologie
- Alignement avec les standards du secteur

**À surveiller** :
- Certains projets borderline peuvent devenir moins attractifs
- Communication nécessaire sur le changement de méthode

### Recommandation communication

> "Nous avons amélioré notre modèle de projection des prix de l'énergie pour
> mieux refléter le retour progressif à l'équilibre après les crises récentes.
> Cette approche, basée sur des modèles économiques reconnus, vous garantit
> des estimations plus réalistes et fiables sur le long terme."

---

## 🎓 Pour aller plus loin

### Options avancées (futur)

1. **Scénarios multiples**
   - Optimiste : Taux d'équilibre plus bas
   - Réaliste : Taux recommandés actuels
   - Pessimiste : Taux d'équilibre plus élevés

2. **Calibration automatique**
   - Mise à jour annuelle des paramètres selon nouvelles données
   - API de projections institutionnelles (AIE, RTE)

3. **Monte Carlo**
   - Simulations probabilistes
   - Intervalles de confiance sur les projections

### Monitoring et ajustement

**Indicateurs à suivre** (révision annuelle) :

- Inflation réelle vs prévue
- Évolution du mix énergétique (part ENR)
- Prix du CO2 (EU ETS)
- Projections officielles (AIE World Energy Outlook)

**Critères de révision des paramètres** :

- Si écart > 20% entre prévisions et réel pendant 2 ans : ajuster taux équilibre
- Si nouvelle crise majeure : évaluer impact sur taux récent
- Si changement réglementaire majeur (ex: nouvelle taxe carbone) : ajuster

---

## 📚 Références complètes

1. Weron, R. (2014). "Electricity price forecasting: A review of the state-of-the-art with a look into the future." International Journal of Forecasting, 30(4), 1030-1081.

2. Lucia, J.J., & Schwartz, E.S. (2002). "Electricity prices and power derivatives: Evidence from the nordic power exchange." Review of Derivatives Research, 5(1), 5-50.

3. Joint Research Centre (2025). "Tackling energy price volatility: a smarter approach to price forecasting." European Commission.

4. Holt, C.C. (2004). "Forecasting seasonals and trends by exponentially weighted moving averages." International Journal of Forecasting, 20(1), 5-10.

5. Benth, F.E., & Koekebakker, S. (2008). "Stochastic modeling of financial electricity contracts." Energy Economics, 30(3), 1116-1157.

6. AIE (2024). "World Energy Outlook 2024." Agence Internationale de l'Énergie.

7. RTE (2022). "Futurs énergétiques 2050." Réseau de Transport d'Électricité France.

---

## ✨ Conclusion

L'implémentation du modèle **Mean Reversion** est fortement recommandée car :

1. ✅ **Fondement scientifique solide** : modèle reconnu en économie de l'énergie
2. ✅ **Correction d'une surestimation de ~40%** du bénéfice
3. ✅ **Simplicité** : facile à comprendre et expliquer aux clients
4. ✅ **Crédibilité** : alignement avec les pratiques du secteur
5. ✅ **Flexibilité** : paramètres ajustables selon nouvelles données

**Impact immédiat attendu** :
- Projections plus réalistes et défendables
- Meilleure confiance des utilisateurs
- Alignement avec les standards professionnels

**Effort d'implémentation** :
- Phase 1 (intégration technique) : 2-3 heures
- Tests et validation : 1 heure
- Documentation utilisateur : 1 heure

**ROI** : Très élevé - améliore significativement la crédibilité de l'outil
