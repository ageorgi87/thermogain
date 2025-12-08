import type { YearlyData } from "@/types/yearlyData"
import { roundToDecimals } from "@/lib/utils/roundToDecimals"

/**
 * Calcule la période de retour sur investissement (ROI / Payback Period)
 * Trouve la première année où la position cumulée devient positive
 * Position cumulée = économies cumulées - investissement (déduit année 1)
 * @param yearlyData Données annuelles précalculées
 * @param investment Investissement initial
 * @returns Nombre d'années pour atteindre le ROI, ou null si pas atteint
 */
export const calculatePaybackPeriod = (
  yearlyData: YearlyData[],
  investment: number
): number | null => {
  // Calculer la position cumulée pour chaque année (même logique que YearlyBreakdownTable)
  let positionCumulee = 0

  for (let i = 0; i < yearlyData.length; i++) {
    // Déduire l'investissement en année 1 (index 0)
    const investissement = i === 0 ? investment : 0
    positionCumulee = positionCumulee + yearlyData[i].economie - investissement

    // ROI atteint quand position cumulée devient positive
    if (positionCumulee >= 0) {
      // Interpolation linéaire pour plus de précision
      if (i === 0) return 1

      const prevYear = yearlyData[i - 1]
      const currentYear = yearlyData[i]

      // Position cumulée de l'année précédente
      const prevPosition = i === 1
        ? prevYear.economie - investment
        : positionCumulee - currentYear.economie

      // Montant restant à récupérer
      const remainingAmount = Math.abs(prevPosition)
      const yearSavings = currentYear.economie

      const fractionOfYear = remainingAmount / yearSavings
      // Le croisement se produit PENDANT l'année i
      return roundToDecimals(i + fractionOfYear, 1)
    }
  }

  return null // ROI non atteint dans la période
}
