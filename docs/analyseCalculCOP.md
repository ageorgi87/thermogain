# Analyse : Méthode de Calcul du COP Ajusté pour les PAC

**Date d'analyse :** 9 décembre 2024
**Sources :** ADEME, DTU 65.16, XPair, recherche technique
**Objectif :** Valider la méthode de calcul du COP ajusté selon température et émetteurs

---

## 🔍 Question posée

Actuellement, notre code applique **DEUX facteurs de correction** pour les émetteurs :
1. **Facteur température** (basé sur température de départ)
2. **Facteur émetteur** (basé sur type d'émetteur)

**Est-ce une double pénalité injustifiée ou une méthode correcte ?**

---

## 📚 Ce que disent les sources officielles

### 1. ADEME (2024-2025)

**Règle principale découverte :**
> "Lorsque vous baissez de 10 °C l'eau qui circule dans vos radiateurs, vous gagnez 1 point de COP."

**Traduction en facteurs :**
- 35°C (plancher chauffant) → COP de référence
- 45°C (radiateurs BT) → -1 point de COP (-10°C)
- 55°C (radiateurs MT) → -2 points de COP (-20°C)
- 65°C (radiateurs HT) → -3 points de COP (-30°C)

**Exemple concret :**
Si COP nominal = 5 à 35°C :
- À 45°C : COP = 5 - 1 = **4** (facteur 0.80)
- À 55°C : COP = 5 - 2 = **3** (facteur 0.60)
- À 65°C : COP = 5 - 3 = **2** (facteur 0.40)

### 2. XPair / Régulation ErP

**Données de performance saisonnière :**
- **Basse température (35°C) :** SCOP = 191% (facteur 1.0)
- **Moyenne température (55°C) :** SCOP = 138% (facteur 0.72)

**Ratio de dégradation :** 138/191 = **0.72**

Cela correspond à une perte de **28% de performance** entre 35°C et 55°C.

### 3. DTU 65.16

Le DTU ne fournit pas de table de correction explicite, mais établit :
- COP mesuré à des points normalisés (ex: 7/55)
- Importance de minimiser l'écart de température
- Différenciation entre émetteurs BT et HT

---

## 🧮 Analyse de notre méthode actuelle

### Notre implémentation

```typescript
// Facteur 1 : Température
const facteurTemperature = getTemperatureAdjustment(temperature);
// 35°C → 1.0
// 45°C → 0.85
// 55°C → 0.75
// 65°C → 0.65

// Facteur 2 : Émetteur
const facteurEmetteurs = getEmitterAdjustment(typeEmetteurs);
// Plancher chauffant → 1.0
// Radiateurs BT → 0.9
// Ventilo-convecteurs → 0.95
// Radiateurs HT → 0.7

// COP ajusté = COP nominal × facteurTemp × facteurEmetteur × facteurClimat
```

### Exemple : Radiateurs BT à 45°C

**Notre méthode actuelle :**
```
COP ajusté = 5 × 0.85 (temp) × 0.9 (émetteur) = 5 × 0.765 = 3.825
```

**Pénalité totale : 23.5%**

---

## ⚠️ Problème identifié : Double pénalité

### Le facteur "émetteur" est-il justifié ?

Analysons ce que représente chaque facteur :

#### Facteur température (physique)
- **Ce qu'il mesure :** Impact thermodynamique direct
- **Base physique :** Cycle de Carnot, différentiel de température
- **Justification :** ✅ Fondé sur les lois de la thermodynamique

#### Facteur émetteur (redondance ?)
- **Ce qu'il mesure :** Type de radiateur
- **Mais :** Le type de radiateur **DÉTERMINE** la température nécessaire !
  - Plancher chauffant = 35°C (déjà inclus dans facteur temp)
  - Radiateurs BT = 45°C (déjà inclus dans facteur temp)
  - Radiateurs HT = 65°C (déjà inclus dans facteur temp)

**Conclusion :** Le facteur émetteur crée une **double pénalité** pour le même phénomène physique.

---

## 🎯 Méthode correcte recommandée

### Approche 1 : Facteur unique basé sur température

**Utiliser UNIQUEMENT le facteur température (dérivé de l'émetteur) :**

```typescript
const temperature = getTemperatureFromEmitterType(typeEmetteurs);
const facteurTemperature = getTemperatureAdjustment(temperature);
const copAjuste = copNominal × facteurTemperature × facteurClimat;
```

**Exemple : Radiateurs BT (45°C)**
```
COP ajusté = 5 × 0.85 × 0.9 (climat) = 3.825
```

### Approche 2 : Facteur unique basé sur émetteur

**Utiliser UNIQUEMENT un facteur émetteur unifié :**

```typescript
const facteurEmetteur = getUnifiedEmitterFactor(typeEmetteurs);
const copAjuste = copNominal × facteurEmetteur × facteurClimat;
```

**Table de facteurs unifiés (basée sur ADEME) :**
```typescript
EMITTER_COP_ADJUSTMENT = {
  "Plancher chauffant": 1.0,      // 35°C optimal
  "Radiateurs basse température": 0.85,  // 45°C : -1 point COP
  "Ventilo-convecteurs": 0.85,    // 45°C mais meilleur échange
  "Radiateurs moyenne température": 0.70,  // 55°C : -2 points COP
  "Radiateurs haute température": 0.55,   // 65°C : -3 points COP
}
```

---

## 📊 Comparaison des méthodes

### Cas test : COP nominal 5, Radiateurs BT, Zone H1b

| Méthode | Calcul | COP Final | Écart |
|---------|--------|-----------|-------|
| **Actuelle (double facteur)** | 5 × 0.85 × 0.9 × 0.9 | **3.44** | Baseline |
| **ADEME (température seule)** | 5 × 0.85 × 0.9 | **3.82** | +11% |
| **Facteur unifié** | 5 × 0.85 × 0.9 | **3.82** | +11% |

### Cas test : COP nominal 5, Radiateurs HT, Zone H1b

| Méthode | Calcul | COP Final | Écart |
|---------|--------|-----------|-------|
| **Actuelle (double facteur)** | 5 × 0.65 × 0.7 × 0.9 | **2.05** | Baseline |
| **ADEME (température seule)** | 5 × 0.65 × 0.9 | **2.93** | +43% |
| **Facteur unifié** | 5 × 0.55 × 0.9 | **2.48** | +21% |

---

## ✅ Recommandations

### Recommandation #1 : Supprimer la double pénalité

**Action :** Ne pas multiplier facteur température ET facteur émetteur.

**Justification :**
1. Les sources ADEME ne mentionnent qu'**UN SEUL** facteur de correction (température)
2. Le type d'émetteur **détermine** la température, pas l'inverse
3. Appliquer les deux crée une pénalité excessive non fondée

### Recommandation #2 : Utiliser facteur température uniquement

**Implémentation simplifiée :**

```typescript
export const calculateAdjustedCOP = (
  copFabricant: number,
  typeEmetteurs: string,
  codePostal?: string,
  typePac?: string
): number => {
  const isAirToAir = typePac === PacType.AIR_AIR;

  // Facteur température (déduit automatiquement de l'émetteur)
  const facteurTemperature = isAirToAir
    ? 1.0
    : getTemperatureAdjustment(getTemperatureFromEmitterType(typeEmetteurs));

  // Facteur climatique
  const facteurClimatique = codePostal
    ? getClimateAdjustment(codePostal)
    : 1.0;

  // COP ajusté = COP nominal × température × climat
  return roundToDecimals(
    copFabricant * facteurTemperature * facteurClimatique,
    2
  );
};
```

### Recommandation #3 : Ajuster les facteurs selon ADEME

**Recalibrer les facteurs température selon la règle "10°C = 1 point COP" :**

```typescript
const getTemperatureAdjustment = (temperatureDepart: number): number => {
  // Référence : 35°C (plancher chauffant) = COP optimal (1.0)
  // Règle ADEME : -1 point COP par 10°C supplémentaires

  // Calcul simplifié : pour un COP nominal de 5
  // Δ COP = (température - 35) / 10
  // Facteur = 1 - (Δ COP / 5)

  if (temperatureDepart <= 35) return 1.0;   // Optimal
  if (temperatureDepart <= 45) return 0.80;  // -1 point sur 5 = -20%
  if (temperatureDepart <= 55) return 0.60;  // -2 points sur 5 = -40%
  return 0.40;                                // -3 points sur 5 = -60%
};
```

---

## 🔬 Validation empirique

### Données ADEME observées

**COP moyens mesurés sur 100 installations :**
- Moyenne générale : **2.9**
- Meilleurs systèmes : **> 4.0**
- Systèmes mal configurés : **< 1.8**

**Notre méthode actuelle (double facteur) :**
- Radiateurs BT : COP 3.44 ✅ (cohérent avec moyenne)
- Radiateurs HT : COP 2.05 ⚠️ (pessimiste)

**Méthode simplifiée (facteur unique) :**
- Radiateurs BT : COP 3.82 ✅ (cohérent avec bons systèmes)
- Radiateurs HT : COP 2.48 ✅ (cohérent avec moyenne basse)

---

## 🎯 Conclusion

### La méthode actuelle pénalise DEUX FOIS pour le même phénomène

1. **Facteur température** : Pénalise pour la température élevée
2. **Facteur émetteur** : Pénalise ENCORE pour l'émetteur qui nécessite cette température

**C'est comme pénaliser un étudiant deux fois :**
- Une fois pour avoir eu 10/20
- Une deuxième fois pour être dans la catégorie "élève moyen"

### Solution recommandée

**Supprimer `facteurEmetteurs` du calcul** et utiliser uniquement `facteurTemperature`.

**Impact :**
- COP plus réalistes (+11% à +43% selon cas)
- Meilleure cohérence avec données ADEME
- Simplicité du modèle (un seul facteur physique)
- Respect du principe "Don't Repeat Yourself"

---

## 📋 Action items

1. ✅ Supprimer la ligne `facteurEmetteurs` dans `calculateAdjustedCOP`
2. ✅ Conserver uniquement `facteurTemperature` + `facteurClimatique`
3. ⚠️ Recalibrer les valeurs de `getTemperatureAdjustment` selon règle ADEME (optionnel mais recommandé)
4. ✅ Mettre à jour la documentation
5. ✅ Tester avec projets existants pour vérifier cohérence

---

**Sources :**
- ADEME Infos (2025) : "Comment maximiser la performance de votre pompe à chaleur air/eau"
- XPair : "Pompes à chaleur : le COP ne dit pas tout !"
- DTU 65.16 : Installation de pompe à chaleur
