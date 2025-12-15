import type { ProjectData } from "@/types/projectData"
import { ENERGY_CONVERSION_FACTORS } from "@/config/constants"

/**
 * Extracteurs de données énergétiques
 * Centralise la logique d'extraction des données de consommation et prix selon le type d'énergie
 */

/**
 * Extrait la consommation en kWh selon le type de chauffage actuel
 * @param data Données du projet
 * @param forPacCalculation Si true, pour une PAC existante, retourne les besoins énergétiques (conso * COP actuel)
 */
export const getCurrentConsumptionKwh = (
  data: ProjectData,
  forPacCalculation = false
): number => {
  switch (data.heatingType) {
    case "Fioul":
      return (data.fuelConsumptionLiters || 0) * ENERGY_CONVERSION_FACTORS.FIOUL_KWH_PER_LITRE

    case "Gaz":
      return data.gasConsumptionKwh || 0

    case "GPL":
      return (data.lpgConsumptionKg || 0) * ENERGY_CONVERSION_FACTORS.GPL_KWH_PER_KG

    case "Bois":
      return (data.woodConsumptionSteres || 0) * ENERGY_CONVERSION_FACTORS.BOIS_KWH_PER_STERE

    case "Pellets":
      return (data.pelletsConsumptionKg || 0) * ENERGY_CONVERSION_FACTORS.PELLETS_KWH_PER_KG

    case "Electrique":
      return data.electricityConsumptionKwh || 0

    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      // Si déjà une PAC et qu'on calcule les besoins énergétiques pour la nouvelle PAC
      if (forPacCalculation) {
        return (data.heatPumpConsumptionKwh || 0) * (data.currentCop || 1)
      }
      return data.heatPumpConsumptionKwh || 0

    default:
      console.warn(`Type de chauffage non reconnu: ${data.heatingType}`)
      return 0
  }
}

/**
 * Calcule le coût variable annuel (énergie) selon le type de chauffage actuel
 */
export const calculateCurrentVariableCost = (data: ProjectData): number => {
  switch (data.heatingType) {
    case "Fioul":
      return (data.fuelConsumptionLiters || 0) * (data.fuelPricePerLiter || 0)

    case "Gaz":
      return (data.gasConsumptionKwh || 0) * (data.gasPricePerKwh || 0)

    case "GPL":
      return (data.lpgConsumptionKg || 0) * (data.lpgPricePerKg || 0)

    case "Bois":
      return (data.woodConsumptionSteres || 0) * (data.woodPricePerStere || 0)

    case "Pellets":
      return (data.pelletsConsumptionKg || 0) * (data.pelletsPricePerKg || 0)

    case "Electrique":
      return (data.electricityConsumptionKwh || 0) * (data.electricityPricePerKwh || 0)

    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      return (data.heatPumpConsumptionKwh || 0) * (data.electricityPricePerKwh || 0)

    default:
      console.warn(`Type de chauffage non reconnu: ${data.heatingType}`)
      return 0
  }
}

/**
 * Extrait le prix unitaire de l'énergie selon le type de chauffage
 */
export const getCurrentEnergyPrice = (data: ProjectData): number => {
  switch (data.heatingType) {
    case "Fioul":
      return data.fuelPricePerLiter || 0

    case "Gaz":
      return data.gasPricePerKwh || 0

    case "GPL":
      return data.lpgPricePerKg || 0

    case "Bois":
      return data.woodPricePerStere || 0

    case "Pellets":
      return data.pelletsPricePerKg || 0

    case "Electrique":
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      return data.electricityPricePerKwh || 0

    default:
      console.warn(`Type de chauffage non reconnu: ${data.heatingType}`)
      return 0
  }
}
