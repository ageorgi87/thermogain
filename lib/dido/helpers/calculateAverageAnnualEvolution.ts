/**
 * Calcule le taux d'évolution annuel moyen à partir de données historiques
 */
export const calculateAverageAnnualEvolution = (prices: number[]): number => {
  if (prices.length < 2) return 0

  // Calculer les variations annuelles
  const annualChanges: number[] = []
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      const change = ((prices[i] - prices[i - 1]) / prices[i - 1]) * 100
      annualChanges.push(change)
    }
  }

  // Calculer la moyenne des variations
  if (annualChanges.length === 0) return 0
  const average = annualChanges.reduce((sum, val) => sum + val, 0) / annualChanges.length

  // Arrondir à 1 décimale
  return Math.round(average * 10) / 10
}
