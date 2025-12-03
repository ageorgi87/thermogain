/**
 * Génère un tableau de projection des taux d'évolution
 *
 * Utile pour afficher une courbe de projection dans l'interface
 */

import { EnergyEvolutionModel } from './energyEvolutionData'
import { calculateEvolutionRate } from './calculateEvolutionRate'

/**
 * Génère un tableau de projection des taux d'évolution
 *
 * @param dureeAnnees Nombre d'années de projection
 * @param model Configuration du modèle d'évolution
 * @returns Tableau de taux d'évolution par année
 */
export const generateEvolutionRateProjection = (
  dureeAnnees: number,
  model: EnergyEvolutionModel
): { annee: number; taux: number }[] => {
  const projection = []

  for (let annee = 0; annee < dureeAnnees; annee++) {
    projection.push({
      annee: annee + 1, // Afficher "Année 1" au lieu de "Année 0"
      taux: calculateEvolutionRate(annee, model)
    })
  }

  return projection
}
