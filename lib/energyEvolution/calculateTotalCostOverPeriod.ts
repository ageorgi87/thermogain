/**
 * Calcule le coût total sur une période donnée
 */

import { EnergyEvolutionModel } from './energyEvolutionData'
import { calculateCostForYear } from './calculateCostForYear'

/**
 * Calcule le coût total sur une période donnée
 *
 * @param coutVariable Coût variable année 1
 * @param coutsFixes Coûts fixes annuels
 * @param dureeAnnees Durée de la période en années
 * @param model Configuration du modèle d'évolution
 * @returns Coût total cumulé sur la période
 */
export const calculateTotalCostOverPeriod = (
  coutVariable: number,
  coutsFixes: number,
  dureeAnnees: number,
  model: EnergyEvolutionModel
): number => {
  let coutTotal = 0

  for (let annee = 0; annee < dureeAnnees; annee++) {
    coutTotal += calculateCostForYear(coutVariable, coutsFixes, annee, model)
  }

  return coutTotal
}
