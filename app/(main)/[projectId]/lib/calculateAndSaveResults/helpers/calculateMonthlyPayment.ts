import { roundToDecimals } from "@/lib/utils/roundToDecimals";

interface CalculateMonthlyPaymentParams {
  montant: number
  tauxAnnuel: number
  dureeMois: number
}

/**
 * Calcule la mensualité d'un crédit
 * Formule: M = C × (t / (1 - (1 + t)^(-n)))
 * @param params.montant Montant du crédit
 * @param params.tauxAnnuel Taux d'intérêt annuel en pourcentage
 * @param params.dureeMois Durée en mois
 * @returns Mensualité en euros
 */
export const calculateMonthlyPayment = ({
  montant,
  tauxAnnuel,
  dureeMois,
}: CalculateMonthlyPaymentParams): number => {
  if (montant === 0 || dureeMois === 0) return 0;

  const tauxMensuel = tauxAnnuel / 100 / 12;
  if (tauxMensuel === 0) return montant / dureeMois;

  const mensualite =
    (montant * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -dureeMois));

  return roundToDecimals(mensualite, 2);
}
