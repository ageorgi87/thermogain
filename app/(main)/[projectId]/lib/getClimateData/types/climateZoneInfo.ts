import type { ClimateZone } from "@/app/(main)/[projectId]/lib/getClimateData/types/climateZone";

/**
 * Informations sur une zone climatique
 */
export interface ClimateZoneInfo {
  zone: ClimateZone
  name: string
  description: string
  dju: number // Degrés-Jours Unifiés (base 18°C)
  temperatureMoyenneHiver: number // °C
  temperatureMoyenneEte: number // °C
  copAdjustment: number // Facteur d'ajustement du COP (1.0 = neutre)
}
