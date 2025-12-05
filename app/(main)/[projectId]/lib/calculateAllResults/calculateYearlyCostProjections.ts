import type { ProjectData } from "@/types/projectData";
import type { YearlyData } from "@/types/yearlyData";
import type { EnergyEvolutionModel } from "@/types/energy";
import { calculateCurrentCostProjectedYear } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateCurrentCostProjectedYear";
import { calculatePacCostProjectedYear } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculatePacCostProjectedYear";

interface CalculateYearlyCostProjectionsParams {
  data: ProjectData;
  years: number;
  currentEnergyModel: EnergyEvolutionModel;
  pacEnergyModel: EnergyEvolutionModel;
  pacConsumptionKwh: number;
}

/**
 * Calcule les projections de coûts année par année sur une période donnée
 * Compare les coûts du chauffage actuel vs PAC et calcule les économies
 * @param params.data Données du projet
 * @param params.years Nombre d'années de projection
 * @param params.currentEnergyModel Modèle d'évolution pour le chauffage actuel
 * @param params.pacEnergyModel Modèle d'évolution pour la PAC (électricité)
 * @param params.pacConsumptionKwh Consommation PAC précalculée (pour éviter 17 recalculs)
 * @returns Tableau des projections annuelles (coûts, économies, économies cumulées)
 */
export const calculateYearlyCostProjections = async ({
  data,
  years,
  currentEnergyModel,
  pacEnergyModel,
  pacConsumptionKwh,
}: CalculateYearlyCostProjectionsParams): Promise<YearlyData[]> => {
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
      energyModel: pacEnergyModel,
      pacConsumptionKwh,
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
