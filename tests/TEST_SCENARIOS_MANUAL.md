# Tests End-to-End Manuel - ThermoGain

## 🎯 Objectif

Vérifier la pertinence et la cohérence des résultats de calcul ThermoGain en comparant avec des données du marché et des sources fiables.

---

## 📚 Sources de référence

### Prix de l'énergie (2024)
- **Électricité** : 0.2516 €/kWh (TRV base) | 0.2276 €/kWh (HC/HP heures creuses)
- **Gaz naturel** : 0.10-0.12 €/kWh (tarif réglementé 2024)
- **Fioul** : 0.12-0.18 €/kWh (~1.20-1.80 €/L, 10 kWh/L)
- **Propane** : 0.12-0.18 €/kWh (volatil)
- **Granulés bois** : 0.06-0.09 €/kWh

### Consommation typique par type de maison
- **Maison ancienne mal isolée (années 70)** : 150-200 kWh/m²/an
- **Maison moyenne (années 80-90)** : 100-150 kWh/m²/an
- **Maison récente BBC (post-2012)** : 50-80 kWh/m²/an
- **Maison passive** : 15-30 kWh/m²/an

### COP réalistes selon zone climatique
- **Zone H1 (Nord, Est, Montagne)** : COP 2.8-3.2
- **Zone H2 (Centre, Ouest)** : COP 3.0-3.5
- **Zone H3 (Sud, Méditerranée)** : COP 3.5-4.5

### ROI attendu (sources ADEME, ANAH)
- **Remplacement fioul/propane** : 5-10 ans
- **Remplacement gaz** : 8-15 ans
- **Remplacement électrique** : 10-18 ans

### Coûts d'installation PAC air-eau (2024)
- **PAC seule** : 8 000 - 16 000 €
- **Installation** : 2 000 - 5 000 €
- **Adaptation émetteurs** : 1 500 - 5 000 €
- **Total projet** : 12 000 - 25 000 €

### Aides moyennes (2024 - MaPrimeRénov' + CEE)
- **Ménages très modestes** : 9 000 - 11 000 €
- **Ménages modestes** : 6 000 - 9 000 €
- **Ménages intermédiaires** : 3 000 - 5 000 €
- **Ménages aisés** : 0 - 2 000 € (CEE uniquement)

---

## 🧪 Scénarios de test

### Scénario 1 : Cas typique favorable - Remplacement fioul

**Profil**
- Maison 150m², années 1990, isolation moyenne
- Chauffage fioul : 18 000 kWh/an
- Coût actuel : 2 700 €/an (0.15 €/kWh fioul)
- Zone H1 (région froide)

**Configuration PAC**
- PAC air-eau 12 kW
- COP 3.2 (zone froide)
- Émetteurs : radiateurs basse température (55°C)
- Coût projet : 22 000 € (PAC 15k + install 4k + travaux 3k)
- Aides : 8 000 € (ménage modeste)
- Financement : mixte (4 000 € apport + 10 000 € crédit 7 ans à 3%)

**✅ Résultats attendus**
- **Consommation PAC** : ~5 625 kWh/an (18 000 / 3.2)
- **Coût PAC** : ~1 280 €/an (5 625 × 0.2276)
- **Économies annuelles** : ~1 400 €/an (2 700 - 1 280)
- **ROI** : 7-10 ans
- **Bénéfice net sur 17 ans** : +8 000 à +12 000 €

**📊 Sources**
- ADEME : ROI remplacement fioul 5-10 ans
- Prix fioul 2024 : ~1.50 €/L soit 0.15 €/kWh

---

### Scénario 2 : Cas limite - Appartement récent gaz

**Profil**
- Appartement 70m², post-2012, bonne isolation
- Chauffage gaz : 4 500 kWh/an
- Coût actuel : 570 €/an (0.10 €/kWh + 120 € abonnement)
- Zone H3 (Méditerranée)

**Configuration PAC**
- PAC air-eau 5 kW
- COP 4.5 (climat doux)
- Émetteurs : radiateurs BT (45°C)
- Coût projet : 11 500 € (PAC 8k + install 2k + travaux 1.5k)
- Aides : 2 500 €
- Financement : comptant (9 000 €)

**✅ Résultats attendus**
- **Consommation PAC** : ~1 000 kWh/an (4 500 / 4.5)
- **Coût PAC** : ~228 €/an (1 000 × 0.2276)
- **Économies annuelles** : ~300-400 €/an
- **ROI** : 18-25 ans ⚠️ (rentabilité limite)
- **Bénéfice net sur 17 ans** : +1 000 à +3 000 € (faible)

**📊 Verdict**
- ROI limite car consommation initiale déjà faible
- Intérêt écologique > économique dans ce cas
- Ne pas survendre la rentabilité

---

### Scénario 3 : Cas optimal - Maison propane mal isolée

**Profil**
- Maison 200m², années 1985, mauvaise isolation
- Chauffage propane : 32 000 kWh/an
- Coût actuel : 5 000 €/an (0.15 €/kWh + 200 € entretien)
- Zone H2 (centre France)

**Configuration PAC**
- PAC air-eau 16 kW
- COP 3.0
- Émetteurs : radiateurs BT
- Coût projet : 27 000 € (PAC 18k + install 5k + travaux 4k)
- Aides : 10 000 € (ménage modeste + zone rurale)
- Financement : crédit 17 000 € sur 10 ans à 3.5%

**✅ Résultats attendus**
- **Consommation PAC** : ~10 667 kWh/an (32 000 / 3.0)
- **Coût PAC** : ~2 428 €/an (10 667 × 0.2276)
- **Économies annuelles** : ~2 500 €/an
- **ROI** : 5-7 ans ⭐ (excellent)
- **Bénéfice net sur 17 ans** : +20 000 à +30 000 €

**📊 Sources**
- Propane : énergie la plus chère, ROI excellent
- ADEME confirme : remplacement propane = meilleur ROI

---

### Scénario 4 : Cas électrique - Convecteurs anciens

**Profil**
- Maison 100m², années 1975, isolation moyenne
- Chauffage électrique : 12 000 kWh/an
- Coût actuel : 3 019 €/an (12 000 × 0.2516)
- Zone H2

**Configuration PAC**
- PAC air-eau 8 kW
- COP 3.5
- Émetteurs : plancher chauffant (35°C)
- Coût projet : 18 500 € (PAC 10k + install 3k + plancher 5.5k)
- Aides : 4 000 €
- Financement : crédit 14 500 € sur 8 ans à 3%

**✅ Résultats attendus**
- **Consommation PAC** : ~3 429 kWh/an (12 000 / 3.5)
- **Coût PAC** : ~780 €/an (3 429 × 0.2276)
- **Économies annuelles** : ~2 200 €/an ⚠️ (à vérifier - semble élevé)
- **ROI** : 6-10 ans
- **Bénéfice net sur 17 ans** : +18 000 à +25 000 €

**⚠️ Points d'attention**
- Économies importantes car convecteurs = énergie la plus chère
- Plancher chauffant : coût élevé mais COP optimal
- Vérifier que le plancher est compatible (hauteur sous plafond)

---

### Scénario 5 : Cas défavorable - Maison bois récente

**Profil**
- Maison bois 120m², 2018, RT2012, excellente isolation
- Chauffage granulés bois : 6 000 kWh/an
- Coût actuel : 450 €/an (0.075 €/kWh)
- Zone H2

**Configuration PAC**
- PAC air-eau 6 kW
- COP 4.0
- Émetteurs : plancher chauffant existant
- Coût projet : 13 000 € (PAC 9k + install 2.5k + raccordement 1.5k)
- Aides : 2 000 €
- Financement : comptant 11 000 €

**✅ Résultats attendus**
- **Consommation PAC** : ~1 500 kWh/an (6 000 / 4.0)
- **Coût PAC** : ~341 €/an (1 500 × 0.2276)
- **Économies annuelles** : ~100-150 €/an ⚠️
- **ROI** : >30 ans ❌ (non rentable économiquement)
- **Bénéfice net sur 17 ans** : Négatif (-8 000 à -10 000 €)

**📊 Verdict**
- **NE PAS RECOMMANDER** d'un point de vue économique
- Granulés = énergie la moins chère
- Intérêt uniquement écologique (électricité décarbonée)
- Informer le client honnêtement

---

## ✅ Checklist de validation pour chaque test

### 1. Consommation PAC cohérente
```
Consommation PAC = Besoins / COP
```
- [ ] COP réaliste selon zone climatique
- [ ] Consommation PAC = 25-35% de la consommation actuelle (facteur 3-4)

### 2. Coûts annuels cohérents
- [ ] Coût actuel = Prix énergie × Consommation + Abonnements + Entretien
- [ ] Coût PAC = Prix élec × Consommation PAC + Abonnement élec + Entretien PAC
- [ ] Économies = Coût actuel - Coût PAC

### 3. ROI cohérent
```
ROI (années) = Investissement net / Économies annuelles
```
- [ ] Fioul/Propane : 5-10 ans
- [ ] Gaz : 8-15 ans
- [ ] Électrique : 10-18 ans
- [ ] Bois/Granulés : Non rentable (>20 ans)

### 4. Bénéfice net sur durée de vie
```
Bénéfice net = (Économies × 17 ans) - Investissement net
```
- [ ] Positif pour énergies chères (fioul, propane, élec)
- [ ] Faible ou négatif pour énergies peu chères (gaz, bois)

### 5. Cohérence des évolutions de prix
- [ ] Évolution fioul/propane : 4-6% (volatil)
- [ ] Évolution gaz : 3-5%
- [ ] Évolution électricité : 3-4%
- [ ] Évolution bois : 2-3%

### 6. Vérifications techniques
- [ ] Puissance PAC adaptée au logement (60-80 W/m² en zone H1)
- [ ] COP ajusté selon émetteurs (plancher > radiateurs BT > radiateurs HT)
- [ ] Température de départ cohérente avec émetteurs

---

## 🔍 Points d'attention spécifiques

### Cas où la PAC n'est PAS rentable
1. **Consommation initiale faible** (<50 kWh/m²/an)
2. **Énergie actuelle peu chère** (gaz, bois, granulés)
3. **Climat très doux** (besoin de chauffage minimal)
4. **Maison très bien isolée RT2012/RE2020**
5. **Coût projet élevé** (>25 000 €) + Aides faibles

### Cas où la PAC est TRÈS rentable
1. **Énergie actuelle chère** (fioul, propane, élec convecteurs)
2. **Consommation élevée** (>150 kWh/m²/an)
3. **Maison mal isolée** (à coupler avec travaux isolation idéalement)
4. **Aides importantes** (>8 000 €)
5. **Zone H2/H3** (COP élevé)

---

## 📝 Template de rapport de test

```markdown
## Test : [Nom du scénario]

**Date** : [Date]
**Testeur** : [Nom]

### Configuration
- Surface : XXX m²
- Isolation : [Bonne/Moyenne/Mauvaise]
- Énergie actuelle : [Type]
- Consommation actuelle : XXX kWh/an (XX kWh/m²/an)
- Coût actuel : XXX €/an

### Projet PAC
- Type : [Air-eau/Géothermique]
- Puissance : XX kW
- COP : X.X
- Émetteurs : [Type]
- Coût total : XXX €
- Aides : XXX €
- Financement : [Comptant/Crédit/Mixte]

### Résultats ThermoGain
- Consommation PAC : XXX kWh/an
- Coût PAC : XXX €/an
- Économies annuelles : XXX €/an
- ROI : XX ans
- Bénéfice net 17 ans : XXX €

### Validation
- [ ] Consommation PAC cohérente (÷3 à ÷4)
- [ ] ROI dans les fourchettes attendues
- [ ] Économies crédibles
- [ ] Bénéfice net positif (si applicable)

### Verdict
✅ / ⚠️ / ❌ [Explication]

### Recommandations
[Actions correctives si anomalies détectées]
```

---

## 🎯 Objectif final

- [ ] Tester les 5 scénarios ci-dessus
- [ ] Identifier toute incohérence dans les calculs
- [ ] Corriger les bugs identifiés
- [ ] Documenter les résultats
- [ ] Valider que l'outil donne des résultats réalistes et défendables

**Principe** : Mieux vaut un ROI prudent et crédible qu'un ROI optimiste mais irréaliste. La crédibilité de l'outil en dépend.
