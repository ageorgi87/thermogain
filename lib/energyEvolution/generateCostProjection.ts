/**
 * Génère un tableau de projection des coûts
 *
 * Utile pour afficher une courbe de coûts dans l'interface
 */

import { EnergyEvolutionModel } from './energyEvolutionData'
import { calculateCumulativeEvolutionFactor } from './calculateCumulativeEvolutionFactor'

/**
 * Génère un tableau de projection des coûts
 *
 * @param coutVariable Coût variable année 1
 * @param coutsFixes Coûts fixes annuels
 * @param dureeAnnees Nombre d'années de projection
 * @param model Configuration du modèle d'évolution
 * @returns Tableau de coûts détaillés par année
 */
export const generateCostProjection = (
  coutVariable: number,
  coutsFixes: number,
  dureeAnnees: number,
  model: EnergyEvolutionModel
): { annee: number; cout: number; coutVariable: number; coutsFixes: number }[] => {
  const projection = []

  for (let annee = 0; annee < dureeAnnees; annee++) {
    const facteur = calculateCumulativeEvolutionFactor(annee, model)
    const coutVariableAnnee = coutVariable * facteur
    const coutTotal = coutVariableAnnee + coutsFixes

    projection.push({
      annee: annee + 1,
      cout: coutTotal,
      coutVariable: coutVariableAnnee,
      coutsFixes: coutsFixes
    })
  }

  return projection
}
