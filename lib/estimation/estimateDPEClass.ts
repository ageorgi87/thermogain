import { estimateAnnualConsumption } from "./estimateAnnualConsumption"

interface HousingCharacteristics {
  surface_habitable: number
  annee_construction: number
  qualite_isolation: string
  nombre_occupants: number
  code_postal?: string
}

/**
 * Retourne une estimation de la classe DPE (A à G)
 */
export const estimateDPEClass = (housing: HousingCharacteristics): string => {
  const consommationParM2 = estimateAnnualConsumption(housing) / housing.surface_habitable

  if (consommationParM2 < 50) return "A"
  if (consommationParM2 < 90) return "B"
  if (consommationParM2 < 150) return "C"
  if (consommationParM2 < 230) return "D"
  if (consommationParM2 < 330) return "E"
  if (consommationParM2 < 450) return "F"
  return "G"
}
