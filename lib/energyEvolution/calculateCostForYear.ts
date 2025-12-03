/**
 * Calcule le coût pour une année donnée avec évolution du prix
 *
 * IMPORTANT: Seuls les coûts VARIABLES évoluent avec le temps.
 * Les coûts FIXES (abonnements, entretien) restent constants.
 */

import { EnergyEvolutionModel } from './energyEvolutionData'
import { calculateCumulativeEvolutionFactor } from './calculateCumulativeEvolutionFactor'

/**
 * Calcule le coût pour une année donnée avec évolution du prix
 *
 * @param coutVariable Coût variable année 1 (énergie consommée)
 * @param coutsFixes Coûts fixes annuels (constants sur toute la période)
 * @param annee Année de projection (0 = année 1, 1 = année 2, etc.)
 * @param model Configuration du modèle d'évolution
 * @returns Coût total pour cette année
 */
export const calculateCostForYear = (
  coutVariable: number,
  coutsFixes: number,
  annee: number,
  model: EnergyEvolutionModel
): number => {
  const facteurEvolution = calculateCumulativeEvolutionFactor(annee, model)
  const coutVariableAnnee = coutVariable * facteurEvolution

  return coutVariableAnnee + coutsFixes
}
