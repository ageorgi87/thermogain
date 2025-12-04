import type { ProjectData } from "@/types/projectData";
import { calculateCurrentVariableCost } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateCurrentVariableCost";
import { calculateCurrentFixedCosts } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateCurrentFixedCosts";

/**
 * Calcule le coût TOTAL du chauffage actuel pour la première année (année de référence)
 * Inclut les coûts variables (énergie) ET les coûts fixes (abonnements + entretien)
 *
 * @param data Données du projet
 * @returns Coût total année 1 en euros
 */
export const calculateCurrentCostYear1 = (data: ProjectData): number => {
  const variableCost = calculateCurrentVariableCost(data);
  const fixedCosts = calculateCurrentFixedCosts(data);
  return variableCost + fixedCosts.total;
};
