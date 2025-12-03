/**
 * Types et constantes pour le modèle d'évolution des prix de l'énergie (Mean Reversion)
 *
 * Le modèle Mean Reversion fait une transition linéaire du taux récent vers le taux
 * d'équilibre sur une période de transition (5 ans par défaut).
 */

export interface EnergyEvolutionModel {
  type: 'mean-reversion'
  tauxRecent: number        // Taux actuel influencé par les crises récentes (ex: 8.7%)
  tauxEquilibre: number     // Taux d'équilibre long terme (ex: 3.5%)
  anneesTransition?: number // Durée de transition (défaut: 5 ans)
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
