import { getConsumptionCoefficient } from "./helpers/getConsumptionCoefficient"
import { getOccupancyFactor } from "./helpers/getOccupancyFactor"
import { getConsumptionAdjustment } from "@/lib/climate/getConsumptionAdjustment"

interface HousingCharacteristics {
  surface_habitable: number
  annee_construction: number
  qualite_isolation: string // "Mauvaise", "Moyenne", "Bonne"
  nombre_occupants: number
  code_postal?: string // Optionnel pour ajustement climatique
}

/**
 * Estime la consommation énergétique annuelle en kWh
 * Prend en compte la zone climatique si le code postal est fourni
 */
export const estimateAnnualConsumption = (housing: HousingCharacteristics): number => {
  const coefficientBase = getConsumptionCoefficient(
    housing.annee_construction,
    housing.qualite_isolation
  )

  const facteurOccupation = getOccupancyFactor(housing.nombre_occupants)

  // Ajustement selon la zone climatique (si code postal fourni)
  let facteurClimatique = 1.0
  if (housing.code_postal) {
    facteurClimatique = getConsumptionAdjustment(housing.code_postal)
    console.log(`🌡️ Ajustement climatique (${housing.code_postal}): ${(facteurClimatique * 100 - 100).toFixed(0)}%`)
  }

  // Consommation estimée = Surface × Coefficient × Facteur occupation × Facteur climatique
  const consommationEstimee = housing.surface_habitable * coefficientBase * facteurOccupation * facteurClimatique

  return Math.round(consommationEstimee)
}
