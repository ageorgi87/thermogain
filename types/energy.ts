/**
 * Type pour le modèle d'évolution des prix de l'énergie (Mean Reversion)
 *
 * Le modèle Mean Reversion fait une transition linéaire du taux récent vers le taux
 * d'équilibre sur une période de transition (5 ans par défaut).
 *
 * IMPORTANT: Les modèles sont générés dynamiquement depuis l'API DIDO-SDES
 * via lib/energyEvolution/models/* et cachés en DB.
 * Il n'y a pas de valeurs par défaut - si les données ne sont pas disponibles,
 * l'application doit échouer explicitement.
 */

export interface EnergyEvolutionModel {
  tauxRecent: number        // Taux actuel influencé par les crises récentes (ex: 8.7%)
  tauxEquilibre: number     // Taux d'équilibre long terme (ex: 3.5%)
  anneesTransition?: number // Durée de transition (défaut: 5 ans)
}
