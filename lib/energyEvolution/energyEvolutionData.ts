/**
 * Types, interfaces et constantes pour les modèles d'évolution des prix de l'énergie
 *
 * Ce module centralise les types et configurations par défaut.
 * Voir energyPriceEvolution.README.md pour la documentation complète
 */

export type EnergyEvolutionModelType = 'linear' | 'mean-reversion' | 'dampening'

export interface EnergyEvolutionModel {
  type: EnergyEvolutionModelType
  tauxRecent: number        // Taux actuel influencé par les crises récentes (ex: 8.7%)
  tauxEquilibre: number     // Taux d'équilibre long terme (ex: 3.5%)
  anneesTransition?: number // Pour mean-reversion : durée de transition (défaut: 5)
  lambda?: number           // Pour dampening : vitesse d'amortissement (défaut: 0.15)
}

// ============================================================================
// Configurations par défaut recommandées
// ============================================================================

/**
 * Configuration par défaut pour l'évolution du prix du gaz
 *
 * - Taux récent: 8.7% (moyenne pondérée à 70% sur 10 ans, API DIDO-SDES)
 * - Taux équilibre: 3.5% (inflation 2% + croissance structurelle 1.5%)
 * - Transition: 5 ans (durée typique de normalisation post-crise)
 */
export const DEFAULT_GAS_MODEL: EnergyEvolutionModel = {
  type: 'mean-reversion',
  tauxRecent: 8.7,
  tauxEquilibre: 3.5,
  anneesTransition: 5
}

/**
 * Configuration par défaut pour l'évolution du prix de l'électricité
 *
 * - Taux récent: 6.9% (moyenne pondérée à 70% sur 10 ans, API DIDO-SDES)
 * - Taux équilibre: 2.5% (baisse structurelle ENR + inflation)
 * - Transition: 5 ans
 *
 * Note: L'électricité a un taux d'équilibre plus bas car:
 * - Coûts marginaux des renouvelables en baisse constante
 * - Effet d'apprentissage (courbe de Wright): -20% à chaque doublement de capacité
 * - Décarbonation progressive du mix électrique
 */
export const DEFAULT_ELECTRICITY_MODEL: EnergyEvolutionModel = {
  type: 'mean-reversion',
  tauxRecent: 6.9,
  tauxEquilibre: 2.5,
  anneesTransition: 5
}

/**
 * Configuration alternative: Dampening exponentiel pour le gaz
 *
 * Utilise un amortissement exponentiel au lieu d'une transition linéaire.
 * Résultat légèrement plus conservateur (convergence plus lente).
 */
export const DAMPENING_GAS_MODEL: EnergyEvolutionModel = {
  type: 'dampening',
  tauxRecent: 8.7,
  tauxEquilibre: 3.5,
  lambda: 0.15
}

/**
 * Configuration alternative: Dampening exponentiel pour l'électricité
 */
export const DAMPENING_ELECTRICITY_MODEL: EnergyEvolutionModel = {
  type: 'dampening',
  tauxRecent: 6.9,
  tauxEquilibre: 2.5,
  lambda: 0.15
}

/**
 * Configuration legacy: Modèle linéaire constant (actuel)
 *
 * Conserve le taux d'évolution constant sur toute la période.
 * ⚠️ ATTENTION: Peut surestimer le bénéfice de ~28% à long terme
 */
export const LINEAR_GAS_MODEL: EnergyEvolutionModel = {
  type: 'linear',
  tauxRecent: 8.7,
  tauxEquilibre: 8.7, // Inutilisé en mode linéaire
}

export const LINEAR_ELECTRICITY_MODEL: EnergyEvolutionModel = {
  type: 'linear',
  tauxRecent: 6.9,
  tauxEquilibre: 6.9, // Inutilisé en mode linéaire
}
