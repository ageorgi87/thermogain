import type { ProjectData } from "@/types/projectData";
import { calculateCurrentVariableCost } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateCurrentVariableCost";
import { calculateCurrentFixedCosts } from "@/app/(main)/[projectId]/lib/calculateAllResults/calculateCurrentFixedCosts";

/**
 * Calcule le coût annuel TOTAL du chauffage actuel
 * Inclut les coûts variables (énergie) ET les coûts fixes (abonnements + entretien)
 *
 * @param data Données du projet
 * @returns Coût total annuel en euros
 */
export const calculateCurrentAnnualCost = (data: ProjectData): number => {
  const variableCost = calculateCurrentVariableCost(data);
  const fixedCosts = calculateCurrentFixedCosts(data);
  return variableCost + fixedCosts.total;
};
