import type { GAS_BOILER_EFFICIENCY } from "../../config/heatingEfficiencyData";

/**
 * Détermine la tranche d'âge d'une installation
 */
export const getAgeRange = (
  age: number
): keyof typeof GAS_BOILER_EFFICIENCY.condensing => {
  if (age < 5) return "0-5";
  if (age < 10) return "5-10";
  if (age < 15) return "10-15";
  if (age < 20) return "15-20";
  return "20+";
};
