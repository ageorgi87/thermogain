import type { ProjectData } from "@/types/projectData";
import { calculateYearlyData } from "./calculateYearlyData";

interface CalculateNetBenefitParams {
  data: ProjectData
  years: number
}

/**
 * Calcule le bénéfice net = différence entre coût total chauffage actuel et coût total avec PAC
 * @param params.data Données du projet
 * @param params.years Nombre d'années
 * @returns Bénéfice net en euros (économies réalisées sur toute la période)
 */
export const calculateNetBenefit = async ({
  data,
  years,
}: CalculateNetBenefitParams): Promise<number> => {
  const yearlyData = await calculateYearlyData({ data, years });

  // Coût total avec chauffage actuel sur toute la période
  const coutTotalActuel = yearlyData.reduce((sum, y) => sum + y.coutActuel, 0);

  // Coût total avec PAC (investissement + coûts annuels)
  const coutTotalPac =
    data.reste_a_charge + yearlyData.reduce((sum, y) => sum + y.coutPac, 0);

  // La différence = ce qu'on économise
  return coutTotalActuel - coutTotalPac;
}
