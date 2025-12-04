import type { ProjectData } from "@/types/projectData";
import { calculatePacVariableCost } from "./calculatePacVariableCost";
import { calculatePacFixedCosts } from "./calculatePacFixedCosts";
import { getEnergyModelSync } from "@/lib/getEnergyModelSync";
import { calculateCostForYear } from "@/lib/calculateCostForYear";

interface CalculatePacCostForYearParams {
  data: ProjectData;
  year: number;
}

/**
 * Calcule le coût PAC pour une année donnée avec évolution du prix de l'électricité
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
 * @param params.year Année de projection (0 = année actuelle)
 * @returns Coût projeté en euros
 */
export const calculatePacCostForYear = async ({
  data,
  year,
}: CalculatePacCostForYearParams): Promise<number> => {
  // Coûts variables: évoluent avec le modèle Mean Reversion
  const variableCost = calculatePacVariableCost(data);
  const fixedCosts = calculatePacFixedCosts(data);

  // Récupérer le modèle Mean Reversion depuis la DB
  const model = await getEnergyModelSync("electricite");

  // Utiliser la fonction de calcul qui applique le modèle Mean Reversion
  return calculateCostForYear(variableCost, fixedCosts.total, year, model);
};
