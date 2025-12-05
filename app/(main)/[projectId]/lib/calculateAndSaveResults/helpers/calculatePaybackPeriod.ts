import type { YearlyData } from "@/types/yearlyData"
import { roundToDecimals } from "@/lib/utils/roundToDecimals"

/**
 * Calcule la période de retour sur investissement (ROI / Payback Period)
 * Trouve la première année où les économies cumulées dépassent l'investissement net
 * @param yearlyData Données annuelles précalculées
 * @param investment Investissement initial
 * @returns Nombre d'années pour atteindre le ROI, ou null si pas atteint
 */
export const calculatePaybackPeriod = (
  yearlyData: YearlyData[],
  investment: number
): number | null => {
  for (let i = 0; i < yearlyData.length; i++) {
    if (yearlyData[i].economiesCumulees >= investment) {
      // Interpolation linéaire pour plus de précision
      if (i === 0) return 1

      const prevYear = yearlyData[i - 1]
      const currentYear = yearlyData[i]

      const remainingAmount = investment - prevYear.economiesCumulees
      const yearSavings = currentYear.economie

      const fractionOfYear = remainingAmount / yearSavings
      // Le croisement se produit PENDANT l'année i, donc on part de l'index i-1
      // et on ajoute la fraction. Cela donne le nombre d'années depuis l'année 0.
      return roundToDecimals(i - 1 + fractionOfYear, 1) // Arrondi à 1 décimale
    }
  }

  return null // ROI non atteint dans la période
}
