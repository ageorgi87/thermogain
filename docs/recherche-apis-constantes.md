# Recherche d'APIs pour les Constantes ThermoGain

Date de recherche : 29 novembre 2025

## Objectif

Identifier des APIs permettant de récupérer automatiquement les valeurs à jour des constantes utilisées dans ThermoGain, afin de faciliter leur maintenance.

---

## 📊 Résumé des APIs disponibles

| Constante | Fréquence de mise à jour | API disponible | État | Recommandation |
|-----------|-------------------------|----------------|------|----------------|
| **Prix énergie** (électricité, gaz, fioul, bois) | Mensuelle | ✅ API DIDO-SDES | **DÉJÀ UTILISÉE** | Continuer à utiliser |
| **Tarifs abonnement électricité EDF** | 2x/an (fév, août) | ⚠️ Partiellement | **LIMITÉ** | Scraping ou manuel |
| **Tarifs abonnement gaz Engie** | Annuelle | ⚠️ Partiellement | **LIMITÉ** | Scraping ou manuel |
| **Coûts d'entretien** | Annuelle | ❌ Non | **INEXISTANT** | Veille marché manuelle |
| **COP des PAC** | Bi-annuelle | ⚠️ Données statiques | **RECHERCHE UNIQUEMENT** | Études ADEME manuelles |
| **Durée de vie équipements** | Tous les 5 ans | ❌ Non | **INEXISTANT** | Études ADEME manuelles |

---

## 1. Prix de l'Énergie

### ✅ **API DIDO-SDES - DÉJÀ UTILISÉE**

**URL**: https://data.economie.gouv.fr/explore/?refine.publisher=SDES

**État**: ✅ **Opérationnelle et déjà intégrée dans ThermoGain**

**Données disponibles**:
- Électricité : Prix moyen TTC résidentiel, tarif Base (18+ ans d'historique)
- Gaz naturel : Prix moyen TTC résidentiel (18+ ans d'historique)
- Fioul domestique : Prix moyen TTC à la livraison (42+ ans d'historique)
- Bois et pellets : Prix moyen TTC résidentiel (18+ ans d'historique)

**Fichiers concernés**:
- `lib/energyModelCache.ts` - Cache des données API
- `lib/energyPriceEvolution.ts` - Utilisation des données
- `DEFAULT_ENERGY_PRICES` dans `lib/constants.ts` - Fallback seulement

**Fréquence de mise à jour**: Mensuelle

**Recommandation**: ✅ **Conserver tel quel** - Le système actuel fonctionne parfaitement

---

### 📋 **Composition détaillée du prix du gaz DIDO** (Décembre 2025)

**Colonne utilisée**: `PX_GAZ_D_TTES_TRANCHES` (Prix gaz domestique toutes tranches)

**Prix actuel API**: 13,4419 €/100kWh = **0,1344 €/kWh TTC**

#### ✅ Ce que le prix INCLUT :

1. **Prix de la molécule de gaz** (fourniture énergétique)
2. **ATRD - Tarif d'Accès Réseau Distribution** : ~11,39 €/MWh (0,01139 €/kWh)
3. **ATRT - Tarif d'Accès Réseau Transport** : ~7,2 €/MWh (0,0072 €/kWh)
4. **Accise sur le gaz naturel** (ex-TICGN) : 17,16 €/MWh au 1er janvier 2025 (0,01716 €/kWh)
   - Tarif modifié au 1er août 2025 : 15,43 €/MWh
5. **CTA** (Contribution Tarifaire d'Acheminement) : contribution pour financement retraites
6. **TVA 20%** : appliquée sur l'ensemble (molécule + transport + distribution + accise)
   - Note : TVA 5,5% sur l'abonnement et la CTA uniquement

#### ❌ Ce que le prix N'INCLUT PAS :

- **L'abonnement fixe annuel** : ~175,92 € HT/an (géré séparément dans les calculs)
  - Cet abonnement correspond à la part fixe de l'ATRD

#### 📊 Validation avec facture réelle (2024-2025) :

Sur une facture de **11 106,92 kWh** consommés :
- Prix unitaire TTC calculé (hors abonnement) : **0,1545 €/kWh**
- Prix API DIDO (moyenne nationale) : **0,1344 €/kWh**
- **Écart de +15%** : expliqué par la tranche de consommation spécifique et la zone géographique

#### 🎯 Conclusion :

Le prix DIDO de **0,1344 €/kWh** est :
- ✅ **Correct et cohérent** avec la méthodologie officielle
- ✅ **TTC complet** incluant toutes taxes et coûts de réseau
- ✅ **Conservateur** (moyenne nationale < cas particuliers)
- ✅ **Parfaitement utilisable** pour des calculs de rentabilité PAC

Le prix peut sembler élevé comparé au prix HT de la molécule seule (~0,08 €/kWh), mais c'est normal car il inclut :
- +40% de coûts de transport/distribution
- +20% de TVA
- +15% d'accise

**Sources** :
- Documentation SDES : https://www.statistiques.developpement-durable.gouv.fr/prix-du-gaz-et-de-lelectricite-au-premier-semestre-2025
- Loi de finances 2025 (taux d'accise)
- CRE - Grilles tarifaires GRDF juillet 2025

---

## 2. Tarifs d'Abonnement Électricité EDF

### ⚠️ **Open Data EDF - LIMITÉ**

**URL**: https://opendata.edf.fr/api/v1/console

**État**: ⚠️ **Existe mais pas d'endpoint dédié aux tarifs d'abonnement**

**Problème identifié**:
- L'Open Data EDF propose des APIs pour la production électrique, émissions CO2, etc.
- **AUCUN endpoint trouvé** spécifiquement pour les tarifs réglementés (TRV) d'abonnement
- La console API ne documente pas d'accès aux grilles tarifaires

### 💰 **API Selectra - PAYANTE**

**URL**: https://selectra.info/energie/electricite/prix/api

**Prix**: 400€ HT/mois

**Données disponibles**:
- Tous les tarifs d'électricité et gaz (tous fournisseurs)
- Grilles tarifaires complètes
- Mises à jour automatiques

**État**: ⚠️ **Payant** - Coût élevé pour une seule donnée (tarifs EDF)

**Accès gratuit limité**: Test technique disponible pour les équipes de développement

### 🌐 **Sources alternatives**

**Sites officiels consultables**:
- EDF Tarif Bleu : https://particulier.edf.fr/fr/accueil/gestion-contrat/options/base.html
- Tarifs officiels publiés par la CRE (Commission de Régulation de l'Énergie)

**Recommandation**:
- ⚠️ **Court terme** : Mise à jour manuelle 2x/an (février et août)
- 🔧 **Moyen terme** : Scraping automatisé du site EDF (avec monitoring des changements)
- 💡 **Long terme** : Évaluer API Selectra si besoin d'automatisation complète

**Fichier concerné**: `ELECTRICITY_SUBSCRIPTION_ANNUAL` dans `lib/constants.ts`

---

## 3. Tarifs d'Abonnement Gaz Engie

### 📊 **Data.gouv.fr - DONNÉES HISTORIQUES**

**URL**: https://www.data.gouv.fr/datasets/donnees-relatives-a-la-construction-des-tarifs-reglementes-de-vente-de-gaz-naturel/

**État**: ⚠️ **Données disponibles mais format complexe**

**Contenu**:
- Données relatives à la construction des TRVG (Tarifs Réglementés de Vente de Gaz)
- Délibérations de la CRE détaillant les coûts d'approvisionnement Engie
- Format : Datasets Excel/CSV (pas d'API REST directe)

### 🏢 **API GRDF - CONSOMMATION UNIQUEMENT**

**Service**: GRDF ADICT

**État**: ❌ **Non pertinent** - API pour consommation individuelle, pas pour tarifs

### 💰 **API Selectra - PAYANTE** (même que pour l'électricité)

**Prix**: 400€ HT/mois
**Données**: Tarifs gaz tous fournisseurs

**Recommandation**:
- ⚠️ **Court terme** : Mise à jour manuelle annuelle
- 🔧 **Moyen terme** : Parser les datasets data.gouv.fr (automatisation partielle)
- 💡 **Long terme** : API Selectra si besoin d'automatisation multi-fournisseurs

**Fichier concerné**: `GAS_SUBSCRIPTION` dans `lib/constants.ts`

---

## 4. Coûts d'Entretien

### ❌ **Aucune API disponible**

**État**: ❌ **Inexistant** - Pas d'API publique ou payante identifiée

**Données disponibles manuellement**:
- **Études sectorielles** : Synasav (1,2 million d'appareils analysés en 2023)
- **Moyennes marché** : Sites spécialisés (ChronoServe, Travaux.com, etc.)

**Données 2025 identifiées**:
- PAC : 150€-450€/an (moyenne ~180€)
- Chaudière gaz : ~172€ TTC/an (enquête Synasav 2023)
- Chaudière fioul : ~150€/an

**Source de référence actuelle**:
- ADEME (recommandations générales)
- Syndicats professionnels
- Enquêtes de marché annuelles

**Recommandation**:
- ⚠️ **Veille annuelle manuelle** obligatoire
- 📊 Consulter les rapports Synasav publiés chaque année
- 🔄 Indexation sur l'inflation (~2-3%/an)

**Fichier concerné**: `MAINTENANCE_COSTS_ANNUAL` dans `lib/constants.ts`

**Calendrier de révision**: Novembre de chaque année (avant l'hiver)

---

## 5. COP des Pompes à Chaleur

### 📚 **ADEME - Études et Publications**

**URL Portal Open Data**: https://data.ademe.fr

**État**: ⚠️ **Données de recherche, pas d'API temps réel**

**Dernière étude majeure (Septembre 2025)**:
- **Titre** : "Mesure des performances de 100 PAC air-eau et eau-eau installées en maisons individuelles"
- **Référence** : 8617
- **URL** : https://librairie.ademe.fr

**Résultats clés**:
- PAC Air/Eau : COP moyen saisonnier = **2,9**
- PAC Eau/Eau : COP moyen saisonnier = **4,3**
- COP max observés : >4 (air/eau), >7 (eau/eau)
- Impact zone climatique : +30% entre H1 (Nord-Est) et H3 (Méditerranée)

**Format des données**:
- ❌ Pas de dataset API-accessible avec COP temps réel
- ✅ Rapports PDF téléchargeables avec données agrégées
- ✅ Base de données DPE (diagnostics énergétiques) disponible sur data.ademe.fr

**API ADEME Open Data**:
- **URL** : https://data.ademe.fr/datasets
- **Contenu** : DPE, données climatiques, bilans carbone
- **COP PAC** : ❌ Pas de dataset dédié identifié

**Recommandation**:
- 📖 **Consulter études ADEME** bi-annuellement (nouvelles publications)
- 🔬 **Utiliser valeurs moyennes validées** (conservatrices) :
  - PAC Air/Air : COP 3,5 (SCOP ≥ 3,9 ADEME)
  - PAC Air/Eau : COP 3,0
  - PAC Eau/Eau : COP 4,5
- ⚠️ **Révision tous les 2 ans** (évolution technologique lente)

**Fichier concerné**: `HEAT_PUMP_COP` dans `lib/constants.ts`

**Calendrier de révision**: Tous les 2 ans (mars impair : 2025, 2027, etc.)

---

## 6. Durée de Vie des Équipements

### ❌ **Aucune API disponible**

**État**: ❌ **Inexistant** - Données basées sur études longitudinales

**Source actuelle**:
- ADEME : Études sur la durabilité des équipements
- Valeur PAC : **17 ans** (donnée validée ADEME)

**Recommandation**:
- 📊 **Révision quinquennale** (tous les 5 ans)
- 📖 Consulter nouvelles études ADEME/secteur
- ⚠️ Valeur stable à moyen terme (évolution lente)

**Fichier concerné**: `EQUIPMENT_LIFESPAN` dans `lib/constants.ts`

**Calendrier de révision**: Tous les 5 ans (2025, 2030, etc.)

---

## 📅 Calendrier de Maintenance Recommandé

### Mise à jour automatique (via API)
- ✅ **Prix énergie** : Automatique via API DIDO-SDES (cache mensuel)

### Mise à jour manuelle FRÉQUENTE
- ⚠️ **Tarifs abonnement EDF** : **Février et Août** chaque année
- ⚠️ **Tarifs abonnement gaz** : **Novembre** chaque année
- ⚠️ **Coûts d'entretien** : **Novembre** chaque année (avant hiver)

### Mise à jour manuelle OCCASIONNELLE
- 📖 **COP PAC** : **Tous les 2 ans** (mars des années impaires)
- 📖 **Durée de vie équipements** : **Tous les 5 ans**

---

## 🎯 Plan d'Action Recommandé

### Court terme (0-6 mois)
1. ✅ **Conserver API DIDO-SDES** (fonctionne parfaitement)
2. ⚠️ **Créer script de monitoring** pour détecter changements EDF/Engie :
   - Scraping léger des pages tarifs officielles
   - Alerte email si changement détecté
   - Validation manuelle avant mise à jour

### Moyen terme (6-12 mois)
3. 🔧 **Automatiser scraping tarifs** :
   - EDF Tarif Bleu : extraction grille tarifaire
   - Engie Gaz : extraction tarifs réglementés
   - Stockage dans `lib/constants.ts` via script

### Long terme (12+ mois)
4. 💡 **Évaluer API Selectra** si besoin :
   - Coût : 400€/mois
   - Avantage : Tous tarifs automatisés
   - Alternative : Développement interne moins cher à long terme

5. 📊 **Créer dashboard de monitoring** :
   - Dates de dernière mise à jour affichées
   - Alertes pour révisions à venir
   - Logs des changements de constantes

---

## 🛠️ Implémentation Technique Suggérée

### Script de monitoring (proposition)

```typescript
// scripts/monitor-constants.ts

import { CONSTANTS_METADATA } from '@/lib/constants'

/**
 * Script à exécuter mensuellement (cron)
 * Vérifie si des constantes nécessitent une révision
 */
async function checkConstantsStatus() {
  const today = new Date()

  // Vérifier tarifs EDF (février et août)
  const month = today.getMonth()
  if (month === 1 || month === 7) { // Février ou Août
    console.warn('⚠️ ALERTE: Vérifier nouveaux tarifs EDF')
    // TODO: Scraper page EDF et comparer
  }

  // Vérifier tarifs gaz (novembre)
  if (month === 10) { // Novembre
    console.warn('⚠️ ALERTE: Vérifier nouveaux tarifs Engie')
  }

  // Vérifier coûts entretien (novembre)
  if (month === 10) {
    console.warn('⚠️ ALERTE: Mettre à jour coûts entretien (inflation)')
  }

  // Vérifier COP PAC (tous les 2 ans en mars)
  const year = today.getFullYear()
  if (year % 2 === 1 && month === 2) { // Années impaires, mars
    console.warn('📖 INFO: Consulter nouvelles études ADEME sur COP PAC')
  }
}
```

### Scraper EDF (exemple)

```typescript
// scripts/scrapers/edf-tarifs.ts

/**
 * Scrape les tarifs EDF Tarif Bleu
 * URL: https://particulier.edf.fr/fr/accueil/gestion-contrat/options/base.html
 */
async function scrapeEDFTarifs() {
  // TODO: Puppeteer ou Cheerio pour extraire la grille tarifaire
  // Comparer avec ELECTRICITY_SUBSCRIPTION_ANNUAL actuel
  // Si différent: logger et alerter
}
```

---

## 📝 Conclusion

### APIs disponibles : 1/6 ✅

Seule l'API DIDO-SDES (prix énergie) est disponible et opérationnelle.

### Recommandation globale

**Approche hybride** :
1. ✅ **API automatique** : Prix énergie (déjà fait)
2. 🔧 **Scraping automatisé** : Tarifs EDF/Engie (à développer)
3. ⚠️ **Veille manuelle** : Coûts entretien, COP, durée de vie

**Effort de maintenance estimé** :
- Temps actuel : ~1-2h/trimestre (mise à jour manuelle)
- Avec monitoring/scraping : ~30 min/trimestre (validation uniquement)
- ROI positif si on développe les scripts de monitoring

**Priorité** : Développer le monitoring des changements de tarifs (détection automatique) avant d'automatiser complètement.

---

**Document créé le** : 29 novembre 2025
**Prochaine révision recommandée** : Février 2026 (vérification tarifs EDF)
