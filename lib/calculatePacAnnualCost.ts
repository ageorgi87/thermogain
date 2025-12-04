import type { ProjectData } from "@/types/projectData";
import { calculatePacVariableCost } from "./calculatePacVariableCost";
import { calculatePacFixedCosts } from "./calculatePacFixedCosts";

/**
 * Calcule le coût annuel TOTAL du chauffage avec PAC
 * Inclut les coûts variables (électricité) ET les coûts fixes (abonnement électricité + entretien PAC)
 *
 * @param data Données du projet
 * @returns Coût total annuel en euros
 */
export const calculatePacAnnualCost = (data: ProjectData): number => {
  const variableCost = calculatePacVariableCost(data);
  const fixedCosts = calculatePacFixedCosts(data);
  return variableCost + fixedCosts.total;
}
