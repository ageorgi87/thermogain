/**
 * ============================================================================
 * CONSTANTES GLOBALES DE CALCUL - THERMOGAIN
 * ============================================================================
 *
 * Ce fichier centralise toutes les constantes statiques utilisées dans les calculs
 * de ThermoGain. Chaque constante est documentée avec:
 * - Sa valeur
 * - Sa source (officielle ou référence)
 * - Son utilisation dans le code
 * - Sa date de dernière mise à jour
 *
 * MAINTENANCE:
 * - Toutes les valeurs provenant de sources externes doivent être vérifiées périodiquement
 * - Les tarifs réglementés (EDF, Engie) changent généralement 1-2 fois par an
 * - Les facteurs de conversion sont des constantes physiques (changent rarement)
 *
 * Dernière révision complète: 29 novembre 2025
 */

// ============================================================================
// 1. FACTEURS DE CONVERSION ÉNERGÉTIQUE (PCI - Pouvoir Calorifique Inférieur)
// ============================================================================

/**
 * Facteurs de conversion des différentes énergies vers kWh
 * Basés sur le PCI (Pouvoir Calorifique Inférieur) - standard européen
 *
 * Source: Standards européens, ADEME
 * Utilisé dans: app/(main)/projects/[projectId]/calculations/pacCost/pacCost.ts
 * Dernière mise à jour: Novembre 2025
 *
 * IMPORTANT: Le PCI (et non le PCS) est utilisé car il correspond à l'énergie
 * réellement utilisable par les systèmes de chauffage modernes.
 */
export const ENERGY_CONVERSION_FACTORS = {
  /**
   * Fioul domestique: 1 litre = 9.96 kWh PCI
   * Source: Standards européens, densité 0.84 kg/L à 10°C
   */
  FIOUL_KWH_PER_LITRE: 9.96,

  /**
   * GPL/Propane: 1 kg = 12.8 kWh PCI
   * Source: Standards européens (valeur théorique: 12.78 kWh/kg)
   */
  GPL_KWH_PER_KG: 12.8,

  /**
   * Pellets/Granulés de bois: 1 kg = 4.6 kWh PCI
   * Source: Standards européens (avec taux d'humidité < 10%)
   * Note: Valeur PCS = 5.1 kWh/kg
   */
  PELLETS_KWH_PER_KG: 4.6,

  /**
   * Bois bûche: 1 stère = 1800 kWh
   * Source: ADEME, moyenne pour bois sec (20-25% humidité)
   * Note: Valeur variable selon essence (chêne, hêtre, etc.) et humidité
   * Valeur PCS: ~1865 kWh/stère
   */
  BOIS_KWH_PER_STERE: 1800,
} as const

// ============================================================================
// 2. TARIFS D'ABONNEMENT ÉLECTRICITÉ (TRV EDF)
// ============================================================================

/**
 * Barème des abonnements électricité EDF - Tarif Bleu (option Base)
 *
 * Source: EDF Tarif Réglementé de Vente (TRV)
 * En vigueur depuis: 1er août 2025
 * URL: https://particulier.edf.fr/fr/accueil/gestion-contrat/options/base.html
 * Utilisé dans: lib/subscriptionRates.ts
 * Prochaine révision attendue: Février 2026
 *
 * Prix TTC incluant: acheminement (TURPE), taxes (CSPE, CTA), TVA 5.5%
 * Option: Base (tarif unique 24h/24)
 * Calcul: Tarif mensuel × 12 = tarif annuel
 */
export const ELECTRICITY_SUBSCRIPTION_ANNUAL = {
  /** 3 kVA : 140,76 €/an (11,73 €/mois) - Très petit logement */
  3: 140.76,
  /** 6 kVA : 185,64 €/an (15,47 €/mois) - Logement standard sans chauffage électrique */
  6: 185.64,
  /** 9 kVA : 232,68 €/an (19,39 €/mois) - Logement avec PAC ou chauffage électrique */
  9: 232.68,
  /** 12 kVA : 279,84 €/an (23,32 €/mois) - Grande maison avec PAC puissante */
  12: 279.84,
  /** 15 kVA : 324,72 €/an (27,06 €/mois) - Très grande maison */
  15: 324.72,
  /** 18 kVA : 369,12 €/an (30,76 €/mois) - Usage professionnel ou très grande maison */
  18: 369.12,
} as const

// ============================================================================
// 3. TARIFS D'ABONNEMENT GAZ
// ============================================================================

/**
 * Abonnement gaz naturel - Tarif Réglementé Engie
 *
 * Source: Engie Tarif Réglementé
 * Dernière mise à jour: Novembre 2024
 * Utilisé dans: lib/subscriptionRates.ts
 *
 * Prix TTC incluant: acheminement (ATRD), taxes (TICGN, CTA), TVA 5.5%
 */
export const GAS_SUBSCRIPTION = {
  /** Coût moyen annuel pour chauffage (12000-20000 kWh/an) */
  ANNUAL_AVERAGE: 120,

  /** Barème détaillé par tranche de consommation */
  BY_CONSUMPTION: {
    /** Base: 0-1000 kWh/an (eau chaude uniquement) */
    BASE: 103,
    /** B0: 1000-6000 kWh/an (eau chaude + cuisson) */
    B0: 120,
    /** B1: 6000-30000 kWh/an (chauffage petit/moyen logement) */
    B1: 120,
    /** B2i: 30000-300000 kWh/an (chauffage grand logement/collectif) */
    B2I: 267,
  },
} as const

// ============================================================================
// 4. COÛTS D'ENTRETIEN ANNUELS
// ============================================================================

/**
 * Coûts moyens d'entretien annuel par type de chauffage
 *
 * Source: ADEME, syndicats professionnels, moyennes marché 2024
 * Utilisé dans: lib/subscriptionRates.ts, calculations
 * Dernière mise à jour: Novembre 2024
 *
 * NOTES LÉGALES:
 * - Entretien chaudière gaz/fioul: OBLIGATOIRE annuellement (décret n°2009-649)
 * - Entretien PAC: Fortement recommandé annuellement, obligatoire tous les 2 ans
 *
 * Prix incluent: visite technicien, nettoyage, réglages, attestation
 */
export const MAINTENANCE_COSTS_ANNUAL = {
  /** Chaudière gaz: ramonage, nettoyage brûleur, contrôle combustion */
  GAZ: 120,
  /** Chaudière fioul: ramonage obligatoire, nettoyage complet */
  FIOUL: 150,
  /** Chaudière GPL: similaire gaz + spécificités GPL */
  GPL: 130,
  /** Poêle/chaudière pellets: nettoyage, ramonage */
  PELLETS: 100,
  /** Poêle bois: ramonage (2x/an si usage principal) */
  BOIS: 80,
  /** Chauffage électrique direct: aucun entretien obligatoire */
  ELECTRIQUE: 0,
  /** PAC: contrôle étanchéité, fluide frigorigène, nettoyage filtres */
  PAC: 120,
} as const

// ============================================================================
// 5. COEFFICIENTS DE PERFORMANCE (COP) PAC
// ============================================================================

/**
 * Coefficients de Performance (COP) typiques pour les pompes à chaleur
 *
 * Source: ADEME - Guide des pompes à chaleur
 * Dernière mise à jour: Novembre 2024
 * Utilisé dans: Documentation, recommandations UI
 *
 * Le COP représente le rapport entre l'énergie thermique produite
 * et l'énergie électrique consommée.
 *
 * IMPORTANT: ADEME recommande un COP minimum de 3.5 pour les installations
 *
 * Note: Ces valeurs sont des moyennes annuelles (SCOP - Seasonal COP).
 * Le COP instantané varie selon la température extérieure:
 * - COP peut atteindre 5 à +7°C
 * - COP peut descendre à 3 à -7°C
 */
export const HEAT_PUMP_COP = {
  /** PAC Air/Air: COP moyen 3-4, SCOP ≥ 3.9 selon ADEME */
  AIR_AIR: {
    MIN: 3,
    MAX: 4,
    AVERAGE: 3.5,
    SCOP_MIN_ADEME: 3.9,
  },
  /** PAC Air/Eau: COP moyen 2.5-3.5, SCOP ~3 selon ADEME */
  AIR_EAU: {
    MIN: 2.5,
    MAX: 3.5,
    AVERAGE: 3,
  },
  /** PAC Eau/Eau (géothermie): COP moyen 4-5, généralement > 4 */
  EAU_EAU: {
    MIN: 4,
    MAX: 5,
    AVERAGE: 4.5,
    /** FPS (Facteur de Performance Saisonnier) européen standard */
    FPS_STANDARD: 3.5,
  },
} as const

// ============================================================================
// 6. DURÉE DE VIE DES ÉQUIPEMENTS
// ============================================================================

/**
 * Durées de vie moyennes des équipements de chauffage
 *
 * Source: ADEME - Études sur la durabilité des équipements
 * Utilisé dans: Calculs de ROI, projections long terme
 * Dernière mise à jour: Novembre 2024
 */
export const EQUIPMENT_LIFESPAN = {
  /** Durée de vie moyenne d'une pompe à chaleur: 17 ans selon ADEME */
  PAC_YEARS: 17,
  /** Chaudière gaz: 15-20 ans */
  CHAUDIERE_GAZ_YEARS: 17,
  /** Chaudière fioul: 15-20 ans */
  CHAUDIERE_FIOUL_YEARS: 17,
  /** Poêle à pellets: 15-20 ans */
  POELE_PELLETS_YEARS: 17,
} as const

// ============================================================================
// 7. PRIX DE L'ÉNERGIE PAR DÉFAUT
// ============================================================================

/**
 * Prix moyens de l'énergie - Utilisés comme valeurs par défaut
 *
 * Source: API DIDO-SDES (moyenne des 12 derniers mois)
 * Utilisé dans: Valeurs par défaut des formulaires
 * Dernière mise à jour: Via API (cache mensuel)
 *
 * IMPORTANT: Ces valeurs sont des fallbacks. Les prix réels proviennent de l'API DIDO.
 */
export const DEFAULT_ENERGY_PRICES = {
  /** Prix moyen TRV Base 2024 */
  ELECTRICITE_KWH: 0.2516,
  /** Prix moyen résidentiel TTC */
  GAZ_KWH: 0.12,
  /** Prix moyen TTC à la livraison */
  FIOUL_LITRE: 1.20,
  /** Prix moyen résidentiel */
  GPL_KG: 2.50,
  /** Prix moyen résidentiel (taux humidité < 10%) */
  PELLETS_KG: 0.40,
  /** Prix moyen résidentiel */
  BOIS_STERE: 90,
} as const

// ============================================================================
// 8. MODÈLE D'ÉVOLUTION DES PRIX (MEAN REVERSION)
// ============================================================================

/**
 * Paramètres du modèle Mean Reversion pour l'évolution des prix de l'énergie
 *
 * Source: Analyse économétrique sur historique API DIDO-SDES (18-42 ans de données)
 * Utilisé dans: lib/energyEvolution/models/analyzeEnergyPriceHistory.ts
 * Dernière mise à jour: Décembre 2024
 *
 * Le modèle Mean Reversion reflète la tendance des prix à revenir vers un taux
 * d'équilibre long terme après des périodes de forte volatilité.
 *
 * Période de transition: 5 ans (taux récent → taux d'équilibre)
 */
export const MEAN_REVERSION_PARAMS = {
  ELECTRICITE: {
    /** Taux d'augmentation récent (5 premières années) */
    RECENT_RATE: 6.9, // %/an
    /** Taux d'équilibre long terme (après transition) */
    EQUILIBRIUM_RATE: 2.5, // %/an
    /** Période de transition */
    TRANSITION_YEARS: 5,
  },
  GAZ: {
    RECENT_RATE: 8.7, // %/an
    EQUILIBRIUM_RATE: 3.5, // %/an
    TRANSITION_YEARS: 5,
  },
  FIOUL: {
    RECENT_RATE: 7.2, // %/an
    EQUILIBRIUM_RATE: 2.5, // %/an
    TRANSITION_YEARS: 5,
  },
  GPL: {
    /** GPL suit le modèle du fioul */
    RECENT_RATE: 7.2, // %/an
    EQUILIBRIUM_RATE: 2.5, // %/an
    TRANSITION_YEARS: 5,
  },
  BOIS: {
    /** Bois et pellets */
    RECENT_RATE: 3.4, // %/an
    EQUILIBRIUM_RATE: 2.0, // %/an
    TRANSITION_YEARS: 5,
  },
} as const

/**
 * Paramètres pour le calcul automatique des taux Mean Reversion
 *
 * Source: Méthodologie économétrique validée
 * Utilisé dans: lib/energyEvolution/models/analyzeEnergyPriceHistory.ts
 * Dernière mise à jour: Décembre 2024
 *
 * MÉTHODOLOGIE:
 * - tauxRecent: Moyenne pondérée pour capturer la volatilité récente tout en
 *   restant ancré dans la tendance structurelle long terme
 *   Formule: (70% × évolution 10 ans) + (30% × évolution totale)
 *
 * - tauxEquilibre: Taux structurel anticipé basé sur l'inflation + facteurs
 *   spécifiques à chaque énergie (transition énergétique, géopolitique, etc.)
 */
export const ENERGY_ANALYSIS_PARAMS = {
  /**
   * Pondération pour le calcul du taux récent
   * 70% sur 10 ans (volatilité récente) + 30% long terme (tendance structurelle)
   */
  RECENT_RATE_WEIGHTING: {
    /** Poids sur les 10 dernières années (crises récentes) */
    SHORT_TERM: 0.7,
    /** Poids sur l'historique complet (tendance structurelle) */
    LONG_TERM: 0.3,
  },

  /**
   * Taux d'inflation long terme utilisé comme base de calcul
   * Source: Objectif BCE (Banque Centrale Européenne)
   */
  INFLATION_BASELINE: 2.0, // %/an

  /**
   * Seuil de détection des années de crise (en %)
   * Une année avec une évolution > 10% est considérée comme année de crise
   * et exclue du calcul du taux d'équilibre
   */
  CRISIS_THRESHOLD: 10, // %/an

  /**
   * Taux d'équilibre par type d'énergie
   * = Inflation baseline + facteur structurel spécifique
   */
  EQUILIBRIUM_RATES: {
    /**
     * Électricité: 2.5%/an
     * = Inflation (2%) + Baisse ENR (-0.5%) + Croissance demande (1%)
     * Facteur baissier: Coûts marginaux renouvelables en diminution
     */
    electricite: 2.5,

    /**
     * Gaz naturel: 3.5%/an
     * = Inflation (2%) + Risque géopolitique (1%) + Transition énergétique (0.5%)
     * Facteur haussier: Dépendance géopolitique, décarbonation progressive
     */
    gaz: 3.5,

    /**
     * Bois énergie: 2.0%/an
     * = Inflation (2%) + Stabilité ressource locale (0%)
     * Facteur stable: Ressource locale, peu sensible aux crises internationales
     */
    bois: 2.0,

    /**
     * Fioul/Pétrole: 2.5%/an
     * = Inflation (2%) + Transition énergétique (0.5%)
     * Facteur modéré: Corrélé au pétrole, en déclin progressif
     */
    fioul: 2.5,
  },
} as const

// ============================================================================
// 9. PARAMÈTRES PAR DÉFAUT DES FORMULAIRES
// ============================================================================

/**
 * Valeurs par défaut recommandées pour les formulaires
 *
 * Source: Expertise sectorielle, recommandations ADEME
 * Utilisé dans: Formulaires multi-étapes
 */
export const FORM_DEFAULTS = {
  /** Durée de vie PAC par défaut (17 ans - ADEME) */
  PAC_LIFESPAN_YEARS: 17,

  /** Puissance souscrite électrique standard (ménage français moyen) */
  ELECTRIC_POWER_DEFAULT_KVA: 6,

  /** Puissance souscrite recommandée avec PAC */
  ELECTRIC_POWER_WITH_PAC_KVA: 9,

  /** Entretien PAC par défaut */
  PAC_MAINTENANCE_ANNUAL: 120,

  /** Connaissance de la consommation (par défaut: oui) */
  KNOWS_CONSUMPTION: true,
} as const

// ============================================================================
// 10. ESTIMATION ECS (EAU CHAUDE SANITAIRE)
// ============================================================================

/**
 * Paramètres pour l'estimation de consommation d'eau chaude sanitaire
 *
 * Source: ADEME - Guide de l'eau chaude sanitaire
 * Utilisé dans: app/(main)/[projectId]/(step)/(content)/ecs-actuel/lib/estimateEcsConsumption.ts
 * Dernière mise à jour: Décembre 2024
 *
 * L'ADEME estime qu'une personne consomme en moyenne 800 kWh/an pour l'eau chaude sanitaire.
 * Cette valeur est utilisée pour estimer la consommation ECS si l'utilisateur ne la connaît pas.
 */
export const ECS_ESTIMATION = {
  /**
   * Consommation moyenne d'eau chaude sanitaire par personne et par an
   * Source: ADEME - 800 kWh/personne/an
   */
  KWH_PER_PERSON_PER_YEAR: 800,
} as const

// ============================================================================
// 11. MÉTADONNÉES DE MAINTENANCE
// ============================================================================

/**
 * Informations pour la maintenance de ce fichier
 */
export const CONSTANTS_METADATA = {
  LAST_FULL_AUDIT: '2025-11-29',
  NEXT_REVIEW_RECOMMENDED: '2026-03-01',
  VERSION: '1.0.0',

  /** Sources officielles à vérifier périodiquement */
  SOURCES: {
    EDF_TARIFS: 'https://particulier.edf.fr/fr/accueil/gestion-contrat/options/base.html',
    DIDO_API: 'https://data.economie.gouv.fr/explore/?refine.publisher=SDES',
    ADEME_PAC: 'https://www.ademe.fr/',
  },

  /** Fréquence de mise à jour recommandée */
  UPDATE_FREQUENCY: {
    ELECTRICITY_SUBSCRIPTION: 'Février et Août (changements TRV)',
    ENERGY_CONVERSION: 'Annuel (constantes physiques, rarement modifiées)',
    MAINTENANCE_COSTS: 'Annuel (inflation)',
    COP_VALUES: 'Bi-annuel (évolution technologies)',
    MEAN_REVERSION: 'Annuel (recalibrage modèle)',
  },
} as const

// ============================================================================
// TYPES UTILITAIRES
// ============================================================================

/** Type pour les clés de puissance électrique */
export type ElectricPowerKVA = keyof typeof ELECTRICITY_SUBSCRIPTION_ANNUAL

/** Type pour les types de chauffage */
export type HeatingType = keyof typeof MAINTENANCE_COSTS_ANNUAL
