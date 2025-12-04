import { calculateMonthlyPayment } from "./calculateMonthlyPayment";

interface CalculateTotalCreditCostParams {
  montant: number
  tauxAnnuel: number
  dureeMois: number
}

/**
 * Calcule le coût total d'un crédit (capital + intérêts)
 * @param params.montant Montant du crédit
 * @param params.tauxAnnuel Taux d'intérêt annuel en pourcentage
 * @param params.dureeMois Durée en mois
 * @returns Coût total du crédit
 */
export const calculateTotalCreditCost = ({
  montant,
  tauxAnnuel,
  dureeMois,
}: CalculateTotalCreditCostParams): number => {
  const mensualite = calculateMonthlyPayment({ montant, tauxAnnuel, dureeMois });
  return Math.round(mensualite * dureeMois * 100) / 100;
}
