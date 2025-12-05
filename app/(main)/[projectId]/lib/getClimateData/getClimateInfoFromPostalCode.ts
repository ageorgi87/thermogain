import { getClimateZoneFromPostalCode } from "@/app/(main)/[projectId]/lib/getClimateData/getClimateZoneFromPostalCode";
import { CLIMATE_ZONES } from "@/app/(main)/[projectId]/lib/getClimateData/config/climateZones";
import type { ClimateZone } from "@/app/(main)/[projectId]/lib/getClimateData/types/climateZone";
import type { ClimateZoneInfo } from "@/app/(main)/[projectId]/lib/getClimateData/types/climateZoneInfo";

/**
 * Récupère les informations complètes d'une zone climatique
 *
 * @param zone - Code de la zone climatique
 * @returns Les informations de la zone
 */
const getClimateZoneInfo = (zone: ClimateZone): ClimateZoneInfo => {
  return CLIMATE_ZONES[zone];
};

/**
 * Récupère les informations climatiques à partir du code postal
 *
 * @param codePostal - Code postal français
 * @returns Les informations de la zone climatique
 */
export const getClimateInfoFromPostalCode = (
  codePostal: string
): ClimateZoneInfo => {
  const zone = getClimateZoneFromPostalCode(codePostal);
  return getClimateZoneInfo(zone);
};
