import {
  WOOD_PELLET_EFFICIENCY,
  MAINTENANCE_FACTORS,
} from "../../config/heatingEfficiencyData";
import { getAgeRange } from "./getAgeRange";

/**
 * Calcule le rendement réel d'un système à bois/pellets
 */
export const calculateWoodPelletEfficiency = (
  age: number,
  condition: "Bon" | "Moyen" | "Mauvais"
): number => {
  const ageRange = getAgeRange(age);
  const baseEfficiency = WOOD_PELLET_EFFICIENCY.modern[ageRange];
  const maintenanceFactor = MAINTENANCE_FACTORS[condition];

  return baseEfficiency * maintenanceFactor;
};
