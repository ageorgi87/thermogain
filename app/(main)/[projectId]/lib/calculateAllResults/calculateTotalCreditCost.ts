import { calculateMonthlyPayment } from "./calculateMonthlyPayment";
import { roundToDecimals } from "@/lib/utils/roundToDecimals";

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
  return roundToDecimals(mensualite * dureeMois, 2);
}
