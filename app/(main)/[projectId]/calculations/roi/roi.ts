import type { ProjectData } from "@/types/projectData";
import { calculateYearlyData } from "../savings/savings";

interface CalculatePaybackPeriodParams {
  data: ProjectData
  maxYears?: number
}

/**
 * Calcule la période de retour sur investissement (ROI / Payback Period)
 * Trouve la première année où les économies cumulées dépassent l'investissement net
 * @param params.data Données du projet
 * @param params.maxYears Nombre d'années maximum à analyser (défaut: 30)
 * @returns Nombre d'années pour atteindre le ROI, ou null si pas atteint
 */
export const calculatePaybackPeriod = async ({
  data,
  maxYears = 30,
}: CalculatePaybackPeriodParams): Promise<number | null> => {
  const yearlyData = await calculateYearlyData({ data, years: maxYears });
  const investment = data.reste_a_charge;

  for (let i = 0; i < yearlyData.length; i++) {
    if (yearlyData[i].economiesCumulees >= investment) {
      // Interpolation linéaire pour plus de précision
      if (i === 0) return 1;

      const prevYear = yearlyData[i - 1];
      const currentYear = yearlyData[i];

      const remainingAmount = investment - prevYear.economiesCumulees;
      const yearSavings = currentYear.economie;

      const fractionOfYear = remainingAmount / yearSavings;
      // Le croisement se produit PENDANT l'année i, donc on part de l'index i-1
      // et on ajoute la fraction. Cela donne le nombre d'années depuis l'année 0.
      return Math.round((i - 1 + fractionOfYear) * 10) / 10; // Arrondi à 1 décimale
    }
  }

  return null; // ROI non atteint dans la période
}

interface CalculatePaybackYearParams {
  data: ProjectData
  maxYears?: number
}

/**
 * Calcule l'année calendaire du retour sur investissement
 * @param params.data Données du projet
 * @param params.maxYears Nombre d'années maximum à analyser
 * @returns Année calendaire du ROI, ou null si pas atteint
 */
export const calculatePaybackYear = async ({
  data,
  maxYears = 30,
}: CalculatePaybackYearParams): Promise<number | null> => {
  const paybackPeriod = await calculatePaybackPeriod({ data, maxYears });
  if (!paybackPeriod) return null;

  // Utiliser Math.floor() pour avoir l'année où le ROI commence à être atteint
  // (correspond à l'année où les courbes se croisent visuellement sur le graphique)
  return new Date().getFullYear() + Math.floor(paybackPeriod);
}

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

  return Math.round(mensualite * 100) / 100;
}

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
