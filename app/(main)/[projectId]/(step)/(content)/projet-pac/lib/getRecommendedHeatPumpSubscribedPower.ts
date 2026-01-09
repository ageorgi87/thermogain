import { HEAT_PUMP_DIVERSITY_FACTOR } from "@/config/constants"

/**
 * Determines recommended electrical power subscription based on heat pump power
 *
 * Calculation logic:
 * 1. Convert heat pump thermal power (kW) to electrical consumption (kW) using COP
 * 2. Apply diversity factor (coefficient de foisonnement) to heat pump consumption
 * 3. Add to current subscribed power (already optimized for household)
 * 4. Round up to next EDF tier (3, 6, 9, 12, 15, 18 kVA)
 *
 * IMPORTANT:
 * - Heat pump rated power is THERMAL output (what heats the home)
 * - Must divide by COP to get ELECTRICAL consumption
 * - Diversity factor (0.7) applied only to heat pump, not existing subscription
 * - Existing subscription already includes household diversity factor
 *
 * Example:
 * - Current: 6 kVA
 * - Heat pump: 8 kW thermal, COP 3.5
 * - Electrical consumption: 8 / 3.5 = 2.29 kW
 * - With diversity (0.7): 2.29 × 0.7 = 1.60 kW
 * - Total: 6 + 1.60 = 7.60 kW → Recommendation: 9 kVA
 *
 * @param heatPumpThermalPowerKw - Heat pump nominal THERMAL power in kW
 * @param currentPowerKva - Current subscribed power in kVA
 * @param estimatedCop - Estimated Coefficient of Performance
 * @returns Recommended power in kVA (3, 6, 9, 12, 15, or 18)
 */
export const getRecommendedHeatPumpSubscribedPower = (
  heatPumpThermalPowerKw: number,
  currentPowerKva: number,
  estimatedCop: number
): number => {
  // 1. Convert thermal power to electrical consumption
  // Heat pump produces heatPumpThermalPowerKw of heat by consuming heatPumpThermalPowerKw/COP of electricity
  const heatPumpElectricalConsumptionKw = heatPumpThermalPowerKw / estimatedCop

  // 2. Apply diversity factor (coefficient de foisonnement)
  // Not all appliances run at max simultaneously. Current subscription already optimized,
  // so we only apply diversity to the ADDED heat pump consumption.
  const heatPumpWithDiversityKw =
    heatPumpElectricalConsumptionKw * HEAT_PUMP_DIVERSITY_FACTOR

  // 3. Calculate total theoretical power needed
  // Note: kVA ≈ kW for residential (power factor cos φ ≈ 0.9-1)
  const theoreticalPowerKw = currentPowerKva + heatPumpWithDiversityKw

  // 4. Round up to next EDF tier
  if (theoreticalPowerKw <= 3) return 3
  if (theoreticalPowerKw <= 6) return 6
  if (theoreticalPowerKw <= 9) return 9
  if (theoreticalPowerKw <= 12) return 12
  if (theoreticalPowerKw <= 15) return 15
  return 18
}
