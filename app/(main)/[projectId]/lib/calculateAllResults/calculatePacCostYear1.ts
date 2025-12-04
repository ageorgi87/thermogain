import type { ProjectData } from "@/types/projectData";
import { calculatePacVariableCost } from "./calculatePacVariableCost";
import { calculatePacFixedCosts } from "./calculatePacFixedCosts";

/**
 * Calcule le coût TOTAL du chauffage avec PAC pour la première année (année de référence)
 * Inclut les coûts variables (électricité) ET les coûts fixes (abonnement électricité + entretien PAC)
 *
 * @param data Données du projet
 * @returns Coût total année 1 en euros
 */
export const calculatePacCostYear1 = (data: ProjectData): number => {
  const variableCost = calculatePacVariableCost(data);
  const fixedCosts = calculatePacFixedCosts(data);
  return variableCost + fixedCosts.total;
}
