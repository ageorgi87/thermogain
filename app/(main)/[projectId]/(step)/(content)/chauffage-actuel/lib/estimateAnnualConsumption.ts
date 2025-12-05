import { getConsumptionCoefficient } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/lib/getConsumptionCoefficient";
import { getOccupancyFactor } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/lib/getOccupancyFactor";
import { getClimateInfoFromPostalCode } from "@/app/(main)/[projectId]/lib/getClimateData/getClimateInfoFromPostalCode";
import { CLIMATE_ZONES } from "@/app/(main)/[projectId]/lib/getClimateData/config/climateZones";
import type { HousingCharacteristics } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/types/housingCharacteristics"

/**
 * Estime la consommation énergétique annuelle en kWh
 * Prend en compte la zone climatique si le code postal est fourni
 */
export const estimateAnnualConsumption = (
  housing: HousingCharacteristics
): number => {
  const coefficientBase = getConsumptionCoefficient({
    anneeConstruction: housing.annee_construction,
    qualiteIsolation: housing.qualite_isolation
  });

  const facteurOccupation = getOccupancyFactor({ nombreOccupants: housing.nombre_occupants });

  // Ajustement selon la zone climatique (si code postal fourni)
  // Inline: La consommation est proportionnelle aux DJU (Degrés Jours Unifiés)
  let facteurClimatique = 1.0;
  if (housing.code_postal) {
    const climateInfo = getClimateInfoFromPostalCode(housing.code_postal);
    const djuReference = CLIMATE_ZONES["H2a"].dju; // 2200 DJU (zone de référence)
    facteurClimatique = climateInfo.dju / djuReference;
  }

  // Consommation estimée = Surface × Coefficient × Facteur occupation × Facteur climatique
  const consommationEstimee =
    housing.surface_habitable *
    coefficientBase *
    facteurOccupation *
    facteurClimatique;

  return Math.round(consommationEstimee);
};
