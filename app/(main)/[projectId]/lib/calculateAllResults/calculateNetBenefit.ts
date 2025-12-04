import type { ProjectData } from "@/types/projectData";
import type { EnergyEvolutionModel } from "@/types/energy";
import { calculateYearlyData } from "./calculateYearlyData";

interface CalculateNetBenefitParams {
  data: ProjectData
  years: number
  currentEnergyModel: EnergyEvolutionModel
  pacEnergyModel: EnergyEvolutionModel
}

/**
 * Calcule le bénéfice net = différence entre coût total chauffage actuel et coût total avec PAC
 * @param params.data Données du projet
 * @param params.years Nombre d'années
 * @param params.currentEnergyModel Modèle d'évolution pour le chauffage actuel
 * @param params.pacEnergyModel Modèle d'évolution pour la PAC
 * @returns Bénéfice net en euros (économies réalisées sur toute la période)
 */
export const calculateNetBenefit = async ({
  data,
  years,
  currentEnergyModel,
  pacEnergyModel,
}: CalculateNetBenefitParams): Promise<number> => {
  const yearlyData = await calculateYearlyData({
    data,
    years,
    currentEnergyModel,
    pacEnergyModel,
  });

  // Coût total avec chauffage actuel sur toute la période
  const coutTotalActuel = yearlyData.reduce((sum, y) => sum + y.coutActuel, 0);

  // Coût total avec PAC (investissement + coûts annuels)
  const coutTotalPac =
    data.reste_a_charge + yearlyData.reduce((sum, y) => sum + y.coutPac, 0);

  // La différence = ce qu'on économise
  return coutTotalActuel - coutTotalPac;
}
