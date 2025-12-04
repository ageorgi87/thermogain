import type { ProjectData } from "@/types/projectData";
import type { EnergyEvolutionModel } from "@/types/energy";
import { calculateYearlyData } from "./calculateYearlyData";

interface CalculateTotalSavingsParams {
  data: ProjectData
  years: number
  currentEnergyModel: EnergyEvolutionModel
  pacEnergyModel: EnergyEvolutionModel
}

/**
 * Calcule les économies totales sur une période donnée
 * @param params.data Données du projet
 * @param params.years Nombre d'années
 * @param params.currentEnergyModel Modèle d'évolution pour le chauffage actuel
 * @param params.pacEnergyModel Modèle d'évolution pour la PAC
 * @returns Économies totales en euros
 */
export const calculateTotalSavings = async ({
  data,
  years,
  currentEnergyModel,
  pacEnergyModel,
}: CalculateTotalSavingsParams): Promise<number> => {
  const yearlyData = await calculateYearlyData({
    data,
    years,
    currentEnergyModel,
    pacEnergyModel,
  });
  return yearlyData[yearlyData.length - 1]?.economiesCumulees || 0;
}
