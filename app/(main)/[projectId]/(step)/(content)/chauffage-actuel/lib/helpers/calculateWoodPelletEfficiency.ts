import {
  WOOD_PELLET_EFFICIENCY,
  MAINTENANCE_FACTORS,
} from "../../config/heatingEfficiencyData";
import { getAgeRange } from "./getAgeRange";
import type { EtatInstallation } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/types/etatInstallation";

/**
 * Calcule le rendement réel d'un système à bois/pellets
 */
export const calculateWoodPelletEfficiency = (
  age: number,
  condition: EtatInstallation
): number => {
  const ageRange = getAgeRange(age);
  const baseEfficiency = WOOD_PELLET_EFFICIENCY.modern[ageRange];
  const maintenanceFactor = MAINTENANCE_FACTORS[condition];

  return baseEfficiency * maintenanceFactor;
};
