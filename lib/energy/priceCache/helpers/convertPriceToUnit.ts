/**
 * Convertit le prix de l'API (€/kWh) vers l'unité appropriée selon le type d'énergie
 */
export const convertPriceToUnit = (pricePerKwh: number, energyType: string): number => {
  switch (energyType) {
    case "fioul":
      // Fioul: 10 kWh/litre → prix en €/litre
      return Math.round(pricePerKwh * 10 * 1000) / 1000 // Arrondir à 3 décimales
    case "gaz":
      // Gaz: prix en €/kWh
      return Math.round(pricePerKwh * 10000) / 10000 // Arrondir à 4 décimales
    case "gpl":
      // GPL: 12.8 kWh/kg → prix en €/kg
      return Math.round(pricePerKwh * 12.8 * 1000) / 1000 // Arrondir à 3 décimales
    case "bois":
      // Bois (granulés): 4.8 kWh/kg → prix en €/kg
      return Math.round(pricePerKwh * 4.8 * 1000) / 1000 // Arrondir à 3 décimales
    case "electricite":
      // Électricité: prix en €/kWh
      return Math.round(pricePerKwh * 10000) / 10000 // Arrondir à 4 décimales
    default:
      return pricePerKwh
  }
}
