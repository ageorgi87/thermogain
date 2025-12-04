import type { ProjectData } from "@/types/projectData";
import type { YearlyData } from "@/types/yearlyData";
import type { EnergyEvolutionModel } from "@/types/energy";
import { calculateCurrentCostProjectedYear } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateCurrentCostProjectedYear";
import { calculatePacCostProjectedYear } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculatePacCostProjectedYear";

interface CalculateYearlyDataParams {
  data: ProjectData;
  years: number;
  currentEnergyModel: EnergyEvolutionModel;
  pacEnergyModel: EnergyEvolutionModel;
}

/**
 * Calcule les données année par année sur une période donnée
 * @param params.data Données du projet
 * @param params.years Nombre d'années de projection
 * @param params.currentEnergyModel Modèle d'évolution pour le chauffage actuel
 * @param params.pacEnergyModel Modèle d'évolution pour la PAC (électricité)
 * @returns Tableau des données annuelles
 */
export const calculateYearlyData = async ({
  data,
  years,
  currentEnergyModel,
  pacEnergyModel,
}: CalculateYearlyDataParams): Promise<YearlyData[]> => {
  const yearlyData: YearlyData[] = [];
  let economiesCumulees = 0;
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < years; i++) {
    const coutActuel = await calculateCurrentCostProjectedYear({
      data,
      year: i,
      energyModel: currentEnergyModel
    });
    const coutPac = await calculatePacCostProjectedYear({
      data,
      year: i,
      energyModel: pacEnergyModel
    });
    const economie = coutActuel - coutPac;
    economiesCumulees += economie;

    yearlyData.push({
      year: currentYear + i,
      coutActuel: coutActuel,
      coutPac: coutPac,
      economie: economie,
      economiesCumulees: economiesCumulees,
    });
  }

  return yearlyData;
};
