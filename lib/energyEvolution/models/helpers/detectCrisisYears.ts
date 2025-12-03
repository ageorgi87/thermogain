/**
 * Détecte les années de crise dans l'historique des prix
 *
 * Une année est considérée comme année de crise si l'évolution annuelle
 * dépasse le seuil défini (par défaut 10%/an).
 */

import { ENERGY_ANALYSIS_PARAMS } from '@/config/constants'

export const detectCrisisYears = (annualEvolutions: number[]): number[] => {
  const crisisYears: number[] = []
  const { CRISIS_THRESHOLD } = ENERGY_ANALYSIS_PARAMS

  annualEvolutions.forEach((evolution, idx) => {
    if (Math.abs(evolution) > CRISIS_THRESHOLD) {
      crisisYears.push(idx + 1) // +1 car évolution année N vs N-1
      console.log(`   🔴 Crise détectée année ${idx + 1}: ${evolution.toFixed(1)}%`)
    }
  })

  return crisisYears
}
