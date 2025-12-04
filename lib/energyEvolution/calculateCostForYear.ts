/**
 * Calcule le coût pour une année donnée avec évolution du prix
 *
 * IMPORTANT: Seuls les coûts VARIABLES évoluent avec le temps.
 * Les coûts FIXES (abonnements, entretien) restent constants.
 */

import type { EnergyEvolutionModel } from '@/types/energy'
import { meanReversionRate } from './meanReversionRate'

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
  // Créer un tableau [0, 1, 2, ..., annee-1] représentant chaque année
  const annees = [...Array(annee).keys()]

  // Calculer le facteur d'évolution (1 + taux%) pour chaque année
  const facteurs = annees.map(anneeIndex => 1 + meanReversionRate(anneeIndex, model) / 100)

  // Multiplier tous les facteurs pour obtenir le facteur d'évolution cumulé
  const facteurEvolution = facteurs.reduce((produit, facteur) => produit * facteur, 1)

  // Appliquer l'évolution au coût variable et ajouter les coûts fixes
  return coutVariable * facteurEvolution + coutsFixes
}
