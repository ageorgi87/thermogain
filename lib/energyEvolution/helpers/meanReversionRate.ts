/**
 * Modèle de retour à la moyenne avec transition linéaire
 *
 * Le taux d'évolution décroît linéairement du taux récent vers le taux d'équilibre
 * pendant la période de transition, puis reste constant au taux d'équilibre.
 *
 * Exemple avec tauxRecent=8.7%, tauxEquilibre=3.5%, transition=5 ans:
 * - Année 0: 8.7%
 * - Année 1: 7.66%
 * - Année 2: 6.62%
 * - Année 3: 5.58%
 * - Année 4: 4.54%
 * - Année 5+: 3.5%
 */

import { EnergyEvolutionModel } from '../energyEvolutionData'

export const meanReversionRate = (
  annee: number,
  model: EnergyEvolutionModel
): number => {
  const { tauxRecent, tauxEquilibre, anneesTransition = 5 } = model

  if (annee < anneesTransition) {
    // Interpolation linéaire pendant la période de transition
    const progression = annee / anneesTransition
    return tauxRecent - (tauxRecent - tauxEquilibre) * progression
  }

  // Après la transition, on utilise le taux d'équilibre
  return tauxEquilibre
}
