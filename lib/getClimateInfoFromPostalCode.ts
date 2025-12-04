import { getClimateZoneFromPostalCode } from "@/lib/getClimateZoneFromPostalCode"
import { getClimateZoneInfo } from "@/lib/getClimateZoneInfo"
import type { ClimateZoneInfo } from "@/lib/climateZonesData"

/**
 * Récupère les informations climatiques à partir du code postal
 *
 * @param codePostal - Code postal français
 * @returns Les informations de la zone climatique
 */
export const getClimateInfoFromPostalCode = (codePostal: string): ClimateZoneInfo => {
  const zone = getClimateZoneFromPostalCode(codePostal)
  return getClimateZoneInfo(zone)
}
