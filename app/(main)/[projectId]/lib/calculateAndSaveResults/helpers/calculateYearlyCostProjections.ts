import type { ProjectData } from "@/types/projectData";
import type { YearlyData } from "@/types/yearlyData";
import type { EnergyEvolutionModel } from "@/types/energy";
import { calculateCurrentVariableCost } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/energyDataExtractors";
import { calculateCurrentFixedCosts } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateCurrentFixedCosts";
import { calculatePacFixedCosts } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculatePacFixedCosts";
import { calculateDhwCosts } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateDhwCosts";
import { ENERGY_ANALYSIS_PARAMS } from "@/config/constants";

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
/**
 * Calcule le taux d'évolution selon le modèle de Mean Reversion
 * Le taux décroît linéairement du taux récent vers le taux d'équilibre
 */
const meanReversionRate = (
  annee: number,
  model: EnergyEvolutionModel
): number => {
  const { tauxRecent, tauxEquilibre, anneesTransition = 5 } = model;

  if (annee < anneesTransition) {
    const progression = annee / anneesTransition;
    return tauxRecent - (tauxRecent - tauxEquilibre) * progression;
  }

  return tauxEquilibre;
};

/**
 * Pré-calcule les facteurs d'évolution cumulés pour toutes les années
 * Optimisation: Calcule une seule fois pour éviter 272 recalculs
 */
const preCalculateEvolutionFactors = (
  years: number,
  model: EnergyEvolutionModel
): number[] => {
  const factors: number[] = [1]; // Année 0: pas d'évolution

  for (let i = 1; i < years; i++) {
    // Facteur d'évolution cumulé = facteur année précédente × (1 + taux%)
    const rate = meanReversionRate(i - 1, model);
    factors.push(factors[i - 1] * (1 + rate / 100));
  }

  return factors;
};

/**
 * Pré-calcule les facteurs d'inflation cumulés pour toutes les années
 * Appliqué aux coûts d'entretien (inflation générale, pas évolution énergétique)
 */
const preCalculateInflationFactors = (years: number): number[] => {
  const factors: number[] = [1]; // Année 0: pas d'inflation
  const inflationRate = ENERGY_ANALYSIS_PARAMS.INFLATION_BASELINE; // 2% par an

  for (let i = 1; i < years; i++) {
    factors.push(factors[i - 1] * (1 + inflationRate / 100));
  }

  return factors;
};

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

  // Calculer les coûts fixes UNE SEULE FOIS (année 1)
  const currentFixedCosts = calculateCurrentFixedCosts(data);
  const pacFixedCosts = calculatePacFixedCosts(data);

  // Calculer les coûts ECS UNE SEULE FOIS (année 1)
  const dhwCosts = calculateDhwCosts(data);

  // Coûts variables année 1 (pour évolution)
  const currentVariableCostYear1 = calculateCurrentVariableCost(data);
  // Prix élec PAC: vient de data.prix_elec_pac (mappé depuis heatPump.heatPumpElectricityPricePerKwh ou heatPump.electricityPricePerKwh)
  // Fallback sur modèle énergétique si vraiment absent (ne devrait jamais arriver)
  const prixElec = data.prix_elec_pac || pacEnergyModel.currentPrice || 0;
  const pacVariableCostYear1 = pacConsumptionKwh * prixElec;

  // PRÉ-CALCULER tous les facteurs d'évolution UNE SEULE FOIS
  const currentEvolutionFactors = preCalculateEvolutionFactors(years, currentEnergyModel);
  const pacEvolutionFactors = preCalculateEvolutionFactors(years, pacEnergyModel);
  const inflationFactors = preCalculateInflationFactors(years);

  for (let i = 0; i < years; i++) {
    // CHAUFFAGE ACTUEL
    // Variables + Abonnements → évolution énergétique (selon type d'énergie)
    // Entretien → inflation générale (2%)
    const coutActuelVariable = currentVariableCostYear1 * currentEvolutionFactors[i];
    const coutActuelAbonnementElec = currentFixedCosts.abonnementElec * currentEvolutionFactors[i];
    const coutActuelAbonnementGaz = currentFixedCosts.abonnementGaz * currentEvolutionFactors[i];
    const coutActuelEntretien = currentFixedCosts.entretien * inflationFactors[i];
    const coutActuelDhw = dhwCosts.currentDhwCost * pacEvolutionFactors[i]; // ECS évolue comme l'électricité
    const coutActuel = coutActuelVariable + coutActuelAbonnementElec + coutActuelAbonnementGaz + coutActuelEntretien + coutActuelDhw;

    // PAC
    // Variables + Abonnement électricité → évolution énergétique (électricité)
    // Entretien PAC → inflation générale (2%)
    const coutPacVariable = pacVariableCostYear1 * pacEvolutionFactors[i];
    const coutPacAbonnement = pacFixedCosts.abonnementElec * pacEvolutionFactors[i];
    const coutPacEntretien = pacFixedCosts.entretien * inflationFactors[i];
    const coutPacDhw = dhwCosts.futureDhwCost * pacEvolutionFactors[i]; // ECS évolue comme l'électricité
    const coutPac = coutPacVariable + coutPacAbonnement + coutPacEntretien + coutPacDhw;

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
