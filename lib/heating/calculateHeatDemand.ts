/**
 * Convertit la consommation de combustible en demande de chaleur réelle
 * en tenant compte du rendement de la chaudière
 *
 * @param fuelConsumption - Consommation de combustible (en unité appropriée)
 * @param fuelEnergyContent - Contenu énergétique du combustible (kWh par unité)
 * @param boilerEfficiency - Rendement de la chaudière (0-1)
 * @returns La demande de chaleur réelle en kWh
 */
export const calculateHeatDemand = (
  fuelConsumption: number,
  fuelEnergyContent: number,
  boilerEfficiency: number
): number => {
  return fuelConsumption * fuelEnergyContent * boilerEfficiency
}
