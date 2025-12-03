/**
 * Modèle d'amortissement exponentiel (exponential dampening)
 *
 * Le taux d'évolution converge exponentiellement vers le taux d'équilibre.
 * Plus le coefficient lambda est élevé, plus la convergence est rapide.
 *
 * Formule: tauxEquilibre + (tauxRecent - tauxEquilibre) × e^(-λ × année)
 *
 * Exemple avec tauxRecent=8.7%, tauxEquilibre=3.5%, lambda=0.15:
 * - Année 0: 8.7%
 * - Année 1: 8.24%
 * - Année 5: 5.95%
 * - Année 10: 4.67%
 * - Année 17: 4.06%
 */

import { EnergyEvolutionModel } from '../energyEvolutionData'

export const dampeningRate = (
  annee: number,
  model: EnergyEvolutionModel
): number => {
  const { tauxRecent, tauxEquilibre, lambda = 0.15 } = model
  const delta = tauxRecent - tauxEquilibre
  const dampeningFactor = Math.exp(-lambda * annee)

  return tauxEquilibre + delta * dampeningFactor
}
