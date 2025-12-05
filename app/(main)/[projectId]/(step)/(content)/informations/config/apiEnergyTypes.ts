import { EnergyType, type ApiEnergyType } from "@/types/energyType"

/**
 * Liste des types d'énergie disponibles dans l'API DIDO
 *
 * Ces 4 énergies ont des endpoints séparés dans l'API DIDO avec des RIDs distincts.
 * GPL n'est pas inclus car il n'a pas d'endpoint dédié (calculé à partir du fioul).
 *
 * Source: API DIDO - SDES
 */
export const API_ENERGY_TYPES: readonly ApiEnergyType[] = [
  EnergyType.GAZ,
  EnergyType.ELECTRICITE,
  EnergyType.FIOUL,
  EnergyType.BOIS
] as const
