/**
 * Modèles d'évolution des prix de l'énergie
 *
 * Ce module implémente différents modèles de projection des prix de l'énergie
 * pour éviter de surestimer l'impact des crises récentes sur le long terme.
 *
 * Voir energyPriceEvolution.README.md pour la documentation complète
 */

export type EnergyEvolutionModelType = 'linear' | 'mean-reversion' | 'dampening'

export interface EnergyEvolutionModel {
  type: EnergyEvolutionModelType
  tauxRecent: number        // Taux actuel influencé par les crises récentes (ex: 8.7%)
  tauxEquilibre: number     // Taux d'équilibre long terme (ex: 3.5%)
  anneesTransition?: number // Pour mean-reversion : durée de transition (défaut: 5)
  lambda?: number           // Pour dampening : vitesse d'amortissement (défaut: 0.15)
}

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

/**
 * Modèle linéaire constant (modèle actuel)
 * Le taux d'évolution reste constant sur toute la période
 */
const linearRate = (model: EnergyEvolutionModel): number => {
  return model.tauxRecent
}

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
const meanReversionRate = (
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
const dampeningRate = (
  annee: number,
  model: EnergyEvolutionModel
): number => {
  const { tauxRecent, tauxEquilibre, lambda = 0.15 } = model
  const delta = tauxRecent - tauxEquilibre
  const dampeningFactor = Math.exp(-lambda * annee)

  return tauxEquilibre + delta * dampeningFactor
}

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
    const tauxAnnee = calculateEvolutionRate(y, model)
    facteur *= (1 + tauxAnnee / 100)
  }

  return facteur
}

/**
 * Calcule le coût pour une année donnée avec évolution du prix
 *
 * IMPORTANT: Seuls les coûts VARIABLES évoluent avec le temps.
 * Les coûts FIXES (abonnements, entretien) restent constants.
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

// ============================================================================
// Configurations par défaut recommandées
// ============================================================================

/**
 * Configuration par défaut pour l'évolution du prix du gaz
 *
 * - Taux récent: 8.7% (moyenne pondérée à 70% sur 10 ans, API DIDO-SDES)
 * - Taux équilibre: 3.5% (inflation 2% + croissance structurelle 1.5%)
 * - Transition: 5 ans (durée typique de normalisation post-crise)
 */
export const DEFAULT_GAS_MODEL: EnergyEvolutionModel = {
  type: 'mean-reversion',
  tauxRecent: 8.7,
  tauxEquilibre: 3.5,
  anneesTransition: 5
}

/**
 * Configuration par défaut pour l'évolution du prix de l'électricité
 *
 * - Taux récent: 6.9% (moyenne pondérée à 70% sur 10 ans, API DIDO-SDES)
 * - Taux équilibre: 2.5% (baisse structurelle ENR + inflation)
 * - Transition: 5 ans
 *
 * Note: L'électricité a un taux d'équilibre plus bas car:
 * - Coûts marginaux des renouvelables en baisse constante
 * - Effet d'apprentissage (courbe de Wright): -20% à chaque doublement de capacité
 * - Décarbonation progressive du mix électrique
 */
export const DEFAULT_ELECTRICITY_MODEL: EnergyEvolutionModel = {
  type: 'mean-reversion',
  tauxRecent: 6.9,
  tauxEquilibre: 2.5,
  anneesTransition: 5
}

/**
 * Configuration alternative: Dampening exponentiel pour le gaz
 *
 * Utilise un amortissement exponentiel au lieu d'une transition linéaire.
 * Résultat légèrement plus conservateur (convergence plus lente).
 */
export const DAMPENING_GAS_MODEL: EnergyEvolutionModel = {
  type: 'dampening',
  tauxRecent: 8.7,
  tauxEquilibre: 3.5,
  lambda: 0.15
}

/**
 * Configuration alternative: Dampening exponentiel pour l'électricité
 */
export const DAMPENING_ELECTRICITY_MODEL: EnergyEvolutionModel = {
  type: 'dampening',
  tauxRecent: 6.9,
  tauxEquilibre: 2.5,
  lambda: 0.15
}

/**
 * Configuration legacy: Modèle linéaire constant (actuel)
 *
 * Conserve le taux d'évolution constant sur toute la période.
 * ⚠️ ATTENTION: Peut surestimer le bénéfice de ~28% à long terme
 */
export const LINEAR_GAS_MODEL: EnergyEvolutionModel = {
  type: 'linear',
  tauxRecent: 8.7,
  tauxEquilibre: 8.7, // Inutilisé en mode linéaire
}

export const LINEAR_ELECTRICITY_MODEL: EnergyEvolutionModel = {
  type: 'linear',
  tauxRecent: 6.9,
  tauxEquilibre: 6.9, // Inutilisé en mode linéaire
}

// ============================================================================
// Utilitaires de projection
// ============================================================================

/**
 * Génère un tableau de projection des taux d'évolution
 *
 * Utile pour afficher une courbe de projection dans l'interface
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

/**
 * Génère un tableau de projection des coûts
 *
 * Utile pour afficher une courbe de coûts dans l'interface
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
