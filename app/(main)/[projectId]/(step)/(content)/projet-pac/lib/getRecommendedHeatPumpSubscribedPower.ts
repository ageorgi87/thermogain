/**
 * Determines recommended electrical power subscription based on heat pump power
 *
 * Calculation logic:
 * - Start from client's current power (which already covers all existing needs)
 * - Add heat pump power (no margin due to diversity factor)
 * - Diversity factor assumes heat pump doesn't always start when
 *   all other household appliances are running simultaneously
 * - Round up to next EDF tier (3, 6, 9, 12, 15, 18 kVA)
 *
 * @param heatPumpPowerKw - Heat pump nominal power in kW
 * @param currentPowerKva - Current subscribed power in kVA
 * @returns Recommended power in kVA (6, 9, 12, 15, or 18)
 */
export const getRecommendedHeatPumpSubscribedPower = (
  heatPumpPowerKw: number,
  currentPowerKva: number
): number => {
  // Theoretical calculation: current power + heat pump power
  const theoreticalPower = currentPowerKva + heatPumpPowerKw

  // Determine by tiers (round up to next tier)
  let recommendedPower: number

  if (theoreticalPower <= 6) {
    recommendedPower = 6
  } else if (theoreticalPower <= 9) {
    recommendedPower = 9
  } else if (theoreticalPower <= 12) {
    recommendedPower = 12
  } else if (theoreticalPower <= 15) {
    recommendedPower = 15
  } else {
    recommendedPower = 18
  }

  return recommendedPower
}
