import { CLIMATE_ZONES, type ClimateZone, type ClimateZoneInfo } from "@/lib/climateZonesData"

/**
 * Récupère les informations complètes d'une zone climatique
 *
 * @param zone - Code de la zone climatique
 * @returns Les informations de la zone
 */
export const getClimateZoneInfo = (zone: ClimateZone): ClimateZoneInfo => {
  return CLIMATE_ZONES[zone]
}
