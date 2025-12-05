import { roundToDecimals } from "@/lib/utils/roundToDecimals";

/**
 * Calculate monthly payment for a loan using the standard amortization formula
 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 * - M = monthly payment
 * - P = principal (loan amount)
 * - r = monthly interest rate (annual rate / 12 / 100)
 * - n = number of payments (months)
 */
export const calculateMensualite = (
  montant: number,
  tauxAnnuel: number,
  dureeMois: number
): number => {
  // If no interest rate, return simple division
  if (tauxAnnuel === 0) {
    return montant / dureeMois
  }

  // Convert annual rate to monthly rate (decimal)
  const tauxMensuel = tauxAnnuel / 12 / 100

  // Calculate monthly payment using amortization formula
  const mensualite =
    (montant * tauxMensuel * Math.pow(1 + tauxMensuel, dureeMois)) /
    (Math.pow(1 + tauxMensuel, dureeMois) - 1)

  // Round to 2 decimal places
  return roundToDecimals(mensualite, 2)
}
