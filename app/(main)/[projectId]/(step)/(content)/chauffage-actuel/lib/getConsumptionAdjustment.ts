import { getClimateInfoFromPostalCode } from "@/app/(main)/[projectId]/lib/getClimateInfoFromPostalCode"
import { CLIMATE_ZONES } from "@/app/(main)/[projectId]/lib/climateZonesData"

/**
 * Calcule le coefficient d'ajustement de consommation selon la zone climatique
 * Utilisé pour ajuster l'estimation de consommation par rapport à une zone de référence (H2a)
 *
 * @param codePostal - Code postal français
 * @returns Coefficient multiplicateur (1.0 = référence H2a)
 */
export const getConsumptionAdjustment = (codePostal: string): number => {
  const info = getClimateInfoFromPostalCode(codePostal)
  const djuReference = CLIMATE_ZONES["H2a"].dju // 2200 DJU

  // La consommation est proportionnelle aux DJU
  return info.dju / djuReference
}
