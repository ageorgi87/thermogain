/**
 * Modèle linéaire constant (modèle actuel)
 * Le taux d'évolution reste constant sur toute la période
 */

import { EnergyEvolutionModel } from '../energyEvolutionData'

export const linearRate = (model: EnergyEvolutionModel): number => {
  return model.tauxRecent
}
