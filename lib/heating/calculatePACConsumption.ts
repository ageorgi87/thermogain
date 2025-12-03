/**
 * Calcule la consommation énergétique d'une PAC pour atteindre une demande de chaleur donnée
 *
 * @param heatDemand - Demande de chaleur en kWh
 * @param cop - Coefficient de Performance de la PAC
 * @returns La consommation électrique de la PAC en kWh
 */
export const calculatePACConsumption = (heatDemand: number, cop: number): number => {
  if (cop <= 0) {
    console.warn(`COP invalide: ${cop}, utilisation de 2.9 (moyenne ADEME) par défaut`)
    cop = 2.9
  }
  return heatDemand / cop
}
