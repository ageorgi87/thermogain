import type { ProjectData } from "@/types/projectData";
import type { EnergyEvolutionModel } from "@/types/energy";
import { calculatePacFixedCosts } from "./calculatePacFixedCosts";
import { applyCostEvolutionModel } from "@/app/(main)/[projectId]/lib/calculateAllResults/applyCostEvolutionModel";

interface CalculatePacCostProjectedYearParams {
  data: ProjectData;
  year: number;
  energyModel: EnergyEvolutionModel;
  pacConsumptionKwh: number;
}

/**
 * Calcule le coût PAC pour une année projetée N avec évolution du prix de l'électricité
 *
 * NOUVEAU (Décembre 2024): Utilise le modèle Mean Reversion basé sur l'historique
 * complet de l'API DIDO-SDES (18+ ans de données) au lieu d'un taux linéaire constant.
 *
 * Le modèle applique:
 * - Taux récent (6,9%/an) sur les 5 premières années
 * - Transition progressive vers le taux d'équilibre (2,5%/an)
 * - Taux d'équilibre stabilisé après 5 ans
 *
 * IMPORTANT: Seuls les coûts VARIABLES (électricité) évoluent avec le temps.
 * Les coûts FIXES (abonnement, entretien) restent constants en euros constants.
 *
 * @param params.data Données du projet
 * @param params.year Année de projection (0 = année 1, 1 = année 2, etc.)
 * @param params.energyModel Modèle d'évolution des prix de l'électricité
 * @param params.pacConsumptionKwh Consommation PAC précalculée (pour éviter recalculs)
 * @returns Coût projeté en euros
 */
export const calculatePacCostProjectedYear = async ({
  data,
  year,
  energyModel,
  pacConsumptionKwh,
}: CalculatePacCostProjectedYearParams): Promise<number> => {
  // Coûts variables: évoluent avec le modèle Mean Reversion
  const prixElec = data.prix_elec_pac || data.prix_elec_kwh || 0;
  const variableCost = pacConsumptionKwh * prixElec;

  const fixedCosts = calculatePacFixedCosts(data);

  // Utiliser la fonction de calcul qui applique le modèle Mean Reversion
  return applyCostEvolutionModel(variableCost, fixedCosts.total, year, energyModel);
};
