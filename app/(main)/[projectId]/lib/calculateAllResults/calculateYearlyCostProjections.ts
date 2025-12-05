import type { ProjectData } from "@/types/projectData";
import type { YearlyData } from "@/types/yearlyData";
import type { EnergyEvolutionModel } from "@/types/energy";
import { calculateCurrentVariableCost } from "@/app/(main)/[projectId]/lib/calculateAllResults/helpers/energyDataExtractors";
import { calculateCurrentFixedCosts } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateCurrentFixedCosts";
import { calculatePacFixedCosts } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculatePacFixedCosts";
import { applyCostEvolutionModel } from "@/app/(main)/[projectId]/lib/calculateAllResults/applyCostEvolutionModel";

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

  // Calculer les coûts fixes UNE SEULE FOIS (constants sur toute la période)
  const currentFixedCosts = calculateCurrentFixedCosts(data);
  const pacFixedCosts = calculatePacFixedCosts(data);

  // Coûts variables année 1 (pour évolution)
  const currentVariableCostYear1 = calculateCurrentVariableCost(data);
  const prixElec = data.prix_elec_pac || data.prix_elec_kwh || 0;
  const pacVariableCostYear1 = pacConsumptionKwh * prixElec;

  for (let i = 0; i < years; i++) {
    // Inline calculateCurrentCostProjectedYear
    const coutActuel = applyCostEvolutionModel(
      currentVariableCostYear1,
      currentFixedCosts.total,
      i,
      currentEnergyModel
    );

    // Inline calculatePacCostProjectedYear
    const coutPac = applyCostEvolutionModel(
      pacVariableCostYear1,
      pacFixedCosts.total,
      i,
      pacEnergyModel
    );
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
