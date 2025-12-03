/**
 * Calcule le facteur d'évolution cumulé pour une année donnée
 */

import { EnergyEvolutionModel } from './energyEvolutionData'
import { meanReversionRate } from './helpers/meanReversionRate'

/**
 * Calcule le facteur d'évolution cumulé pour une année donnée
 *
 * @param annee Année cible (0 = année actuelle)
 * @param model Configuration du modèle d'évolution
 * @returns Facteur multiplicatif cumulé (ex: 1.15 = +15%)
 */
export const calculateCumulativeEvolutionFactor = (
  annee: number,
  model: EnergyEvolutionModel
): number => {
  let facteur = 1

  for (let y = 0; y < annee; y++) {
    const tauxAnnee = meanReversionRate(y, model)
    facteur *= (1 + tauxAnnee / 100)
  }

  return facteur
}
