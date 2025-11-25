import { ProjectData } from "../types"
import { calculateYearlyData } from "../savings/savings"

/**
 * Calcule la période de retour sur investissement (ROI / Payback Period)
 * Trouve la première année où les économies cumulées dépassent l'investissement net
 * @param data Données du projet
 * @param maxYears Nombre d'années maximum à analyser (défaut: 30)
 * @returns Nombre d'années pour atteindre le ROI, ou null si pas atteint
 */
export function calculatePaybackPeriod(
  data: ProjectData,
  maxYears: number = 30
): number | null {
  const yearlyData = calculateYearlyData(data, maxYears)
  const investment = data.reste_a_charge

  for (let i = 0; i < yearlyData.length; i++) {
    if (yearlyData[i].economiesCumulees >= investment) {
      // Interpolation linéaire pour plus de précision
      if (i === 0) return 1

      const prevYear = yearlyData[i - 1]
      const currentYear = yearlyData[i]

      const remainingAmount = investment - prevYear.economiesCumulees
      const yearSavings = currentYear.economie

      const fractionOfYear = remainingAmount / yearSavings
      return Math.round((i + fractionOfYear) * 10) / 10 // Arrondi à 1 décimale
    }
  }

  return null // ROI non atteint dans la période
}

/**
 * Calcule l'année calendaire du retour sur investissement
 * @param data Données du projet
 * @param maxYears Nombre d'années maximum à analyser
 * @returns Année calendaire du ROI, ou null si pas atteint
 */
export function calculatePaybackYear(
  data: ProjectData,
  maxYears: number = 30
): number | null {
  const paybackPeriod = calculatePaybackPeriod(data, maxYears)
  if (!paybackPeriod) return null

  return new Date().getFullYear() + Math.ceil(paybackPeriod)
}

/**
 * Calcule la mensualité d'un crédit
 * Formule: M = C × (t / (1 - (1 + t)^(-n)))
 * @param montant Montant du crédit
 * @param tauxAnnuel Taux d'intérêt annuel en pourcentage
 * @param dureeMois Durée en mois
 * @returns Mensualité en euros
 */
export function calculateMonthlyPayment(
  montant: number,
  tauxAnnuel: number,
  dureeMois: number
): number {
  if (montant === 0 || dureeMois === 0) return 0

  const tauxMensuel = tauxAnnuel / 100 / 12
  if (tauxMensuel === 0) return montant / dureeMois

  const mensualite =
    (montant * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -dureeMois))

  return Math.round(mensualite * 100) / 100
}

/**
 * Calcule le coût total d'un crédit (capital + intérêts)
 * @param montant Montant du crédit
 * @param tauxAnnuel Taux d'intérêt annuel en pourcentage
 * @param dureeMois Durée en mois
 * @returns Coût total du crédit
 */
export function calculateTotalCreditCost(
  montant: number,
  tauxAnnuel: number,
  dureeMois: number
): number {
  const mensualite = calculateMonthlyPayment(montant, tauxAnnuel, dureeMois)
  return Math.round(mensualite * dureeMois * 100) / 100
}
