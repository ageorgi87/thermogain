import type { ProjectData } from "@/types/projectData";
import { calculateYearlyData } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateYearlyData";

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
