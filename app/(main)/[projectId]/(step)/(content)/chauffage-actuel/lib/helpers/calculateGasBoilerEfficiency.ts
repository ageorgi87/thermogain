import {
  GAS_BOILER_EFFICIENCY,
  MAINTENANCE_FACTORS,
} from "../../config/heatingEfficiencyData";
import { getAgeRange } from "./getAgeRange";

/**
 * Calcule le rendement réel d'une chaudière à gaz
 */
export const calculateGasBoilerEfficiency = (
  age: number,
  condition: "Bon" | "Moyen" | "Mauvais",
  isCondensing: boolean = true // Par défaut, on assume condensation (plus courant depuis 2000)
): number => {
  const ageRange = getAgeRange(age);
  const baseEfficiency = isCondensing
    ? GAS_BOILER_EFFICIENCY.condensing[ageRange]
    : GAS_BOILER_EFFICIENCY["non-condensing"][ageRange];

  const maintenanceFactor = MAINTENANCE_FACTORS[condition];

  return baseEfficiency * maintenanceFactor;
};
