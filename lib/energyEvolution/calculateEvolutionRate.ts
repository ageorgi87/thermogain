/**
 * Calcule le taux d'évolution pour une année donnée selon le modèle choisi
 */

import { EnergyEvolutionModel } from './energyEvolutionData'
import { linearRate } from './helpers/linearRate'
import { meanReversionRate } from './helpers/meanReversionRate'
import { dampeningRate } from './helpers/dampeningRate'

/**
 * Calcule le taux d'évolution pour une année donnée selon le modèle choisi
 *
 * @param annee Année de projection (0 = année actuelle, 1 = dans 1 an, etc.)
 * @param model Configuration du modèle d'évolution
 * @returns Taux d'évolution en pourcentage pour cette année
 */
export const calculateEvolutionRate = (
  annee: number,
  model: EnergyEvolutionModel
): number => {
  switch (model.type) {
    case 'linear':
      return linearRate(model)

    case 'mean-reversion':
      return meanReversionRate(annee, model)

    case 'dampening':
      return dampeningRate(annee, model)

    default:
      return model.tauxRecent
  }
}
