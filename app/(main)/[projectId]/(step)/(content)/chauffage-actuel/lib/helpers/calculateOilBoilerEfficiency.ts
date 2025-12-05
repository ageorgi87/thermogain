import {
  OIL_BOILER_EFFICIENCY,
  MAINTENANCE_FACTORS,
} from "../../config/heatingEfficiencyData";
import { getAgeRange } from "./getAgeRange";
import type { EtatInstallation } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/types/etatInstallation";

/**
 * Calcule le rendement réel d'une chaudière au fioul
 */
export const calculateOilBoilerEfficiency = (
  age: number,
  condition: EtatInstallation,
  isCondensing: boolean = false // Les chaudières fioul à condensation sont plus rares
): number => {
  const ageRange = getAgeRange(age);
  const baseEfficiency = isCondensing
    ? OIL_BOILER_EFFICIENCY.condensing[ageRange]
    : OIL_BOILER_EFFICIENCY.standard[ageRange];

  const maintenanceFactor = MAINTENANCE_FACTORS[condition];

  return baseEfficiency * maintenanceFactor;
};
