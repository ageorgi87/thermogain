import { getConsumptionCoefficient } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/lib/getConsumptionCoefficient";
import { getOccupancyFactor } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/lib/getOccupancyFactor";
import { getConsumptionAdjustment } from "@/lib/climate/getConsumptionAdjustment";
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
  let facteurClimatique = 1.0;
  if (housing.code_postal) {
    facteurClimatique = getConsumptionAdjustment(housing.code_postal);
  }

  // Consommation estimée = Surface × Coefficient × Facteur occupation × Facteur climatique
  const consommationEstimee =
    housing.surface_habitable *
    coefficientBase *
    facteurOccupation *
    facteurClimatique;

  return Math.round(consommationEstimee);
};
