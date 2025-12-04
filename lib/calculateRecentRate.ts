/**
 * Calcule le taux d'évolution récent pondéré (70% sur 10 ans + 30% long terme)
 *
 * Cette pondération permet de capturer la volatilité récente tout en restant
 * ancré dans la tendance structurelle long terme.
 */

import { ENERGY_ANALYSIS_PARAMS } from '@/config/constants'

export const calculateRecentRate = (monthlyPrices: number[], yearsOfData: number): number => {
  const recentAvg = monthlyPrices.slice(0, 12).reduce((a, b) => a + b, 0) / 12

  // Long terme: toute la période
  const oldestStartIndex = Math.max(monthlyPrices.length - 12, 0)
  const oldestAvg = monthlyPrices
    .slice(oldestStartIndex, oldestStartIndex + 12)
    .reduce((a, b) => a + b, 0) / 12

  const evolutionLongTerm = ((recentAvg - oldestAvg) / oldestAvg) * 100 / yearsOfData

  // 10 dernières années (si disponible)
  let evolution10y = evolutionLongTerm
  if (monthlyPrices.length >= 120) {
    const avg10yAgo = monthlyPrices.slice(108, 120).reduce((a, b) => a + b, 0) / 12
    evolution10y = ((recentAvg - avg10yAgo) / avg10yAgo) * 100 / 10
  }

  const { SHORT_TERM, LONG_TERM } = ENERGY_ANALYSIS_PARAMS.RECENT_RATE_WEIGHTING
  const tauxRecent = (evolutionLongTerm * LONG_TERM) + (evolution10y * SHORT_TERM)

  console.log(`   📈 Taux récent (${SHORT_TERM * 100}% 10y + ${LONG_TERM * 100}% LT): ${tauxRecent.toFixed(2)}%/an`)

  return tauxRecent
}
