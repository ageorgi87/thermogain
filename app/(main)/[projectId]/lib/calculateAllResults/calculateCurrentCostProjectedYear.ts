import type { ProjectData } from "@/types/projectData";
import type { EnergyEvolutionModel } from "@/types/energy";
import { calculateCurrentVariableCost } from "@/app/(main)/[projectId]/lib/calculateAllResults/helpers/energyDataExtractors";
import { calculateCurrentFixedCosts } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateCurrentFixedCosts";
import { applyCostEvolutionModel } from "@/app/(main)/[projectId]/lib/calculateAllResults/applyCostEvolutionModel";

interface CalculateCurrentCostProjectedYearParams {
  data: ProjectData;
  year: number;
  energyModel: EnergyEvolutionModel;
}

/**
 * Calcule le coût du chauffage actuel pour une année projetée N avec évolution du prix
 *
 * NOUVEAU (Décembre 2024): Utilise le modèle Mean Reversion basé sur l'historique
 * complet de l'API DIDO-SDES (18-42 ans de données selon l'énergie) au lieu d'un
 * taux linéaire constant.
 *
 * Le modèle applique pour chaque type d'énergie:
 * - Gaz: Taux récent 8,7% → Équilibre 3,5% (transition 5 ans)
 * - Électricité: Taux récent 6,9% → Équilibre 2,5% (transition 5 ans)
 * - Fioul: Taux récent 7,2% → Équilibre 2,5% (transition 5 ans)
 * - Bois: Taux récent 3,4% → Équilibre 2,0% (transition 5 ans)
 *
 * IMPORTANT: Seuls les coûts VARIABLES (énergie) évoluent avec le temps.
 * Les coûts FIXES (abonnements, entretien) restent constants en euros constants.
 *
 * @param params.data Données du projet
 * @param params.year Année de projection (0 = année 1, 1 = année 2, etc.)
 * @param params.energyModel Modèle d'évolution des prix énergétiques
 * @returns Coût projeté en euros
 */
export const calculateCurrentCostProjectedYear = async ({
  data,
  year,
  energyModel,
}: CalculateCurrentCostProjectedYearParams): Promise<number> => {
  // Coûts variables: évoluent avec le modèle Mean Reversion
  const variableCost = calculateCurrentVariableCost(data);
  const fixedCosts = calculateCurrentFixedCosts(data);

  // Utiliser la fonction de calcul qui applique le modèle Mean Reversion
  return applyCostEvolutionModel(variableCost, fixedCosts.total, year, energyModel);
};
