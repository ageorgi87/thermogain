import { EnergyType, type ApiEnergyType } from "@/types/energyType"

/**
 * Mappings bidirectionnels entre colonnes DIDO et types d'énergie
 * 
 * Ces mappings centralisent la conversion entre les noms de colonnes
 * de l'API DIDO et les types d'énergie utilisés dans l'application.
 */

/**
 * Mapping : Type d'énergie → Nom de colonne DIDO
 * Utilisé lors du fetch API pour savoir quelle colonne récupérer
 */
export const ENERGY_TYPE_TO_DIDO_COLUMN: Record<ApiEnergyType, string> = {
  [EnergyType.GAZ]: "PX_GAZ_D_TTES_TRANCHES",
  [EnergyType.ELECTRICITE]: "PX_ELE_D_TTES_TRANCHES",
  [EnergyType.FIOUL]: "PX_PETRO_FOD_100KWH_C1",
  [EnergyType.BOIS]: "PX_BOIS_GRANVRAC_100KWH",
}

/**
 * Mapping : Nom de colonne DIDO → Type d'énergie
 * Utilisé pour la conversion inverse (si nécessaire)
 */
export const DIDO_COLUMN_TO_ENERGY_TYPE: Record<string, ApiEnergyType> = {
  "PX_GAZ_D_TTES_TRANCHES": EnergyType.GAZ,
  "PX_ELE_D_TTES_TRANCHES": EnergyType.ELECTRICITE,
  "PX_PETRO_FOD_100KWH_C1": EnergyType.FIOUL,
  "PX_BOIS_GRANVRAC_100KWH": EnergyType.BOIS,
}

/**
 * Récupère le nom de colonne DIDO pour un type d'énergie donné
 */
export const getDidoColumnNameFromEnergyType = (energyType: ApiEnergyType): string => {
  const columnName = ENERGY_TYPE_TO_DIDO_COLUMN[energyType]
  if (!columnName) {
    throw new Error(`Nom de colonne DIDO inconnu pour le type d'énergie: ${energyType}`)
  }
  return columnName
}

/**
 * Récupère le type d'énergie pour un nom de colonne DIDO donné
 */
export const getEnergyTypeFromDidoColumn = (columnName: string): ApiEnergyType => {
  const energyType = DIDO_COLUMN_TO_ENERGY_TYPE[columnName]
  if (!energyType) {
    throw new Error(`Type d'énergie inconnu pour la colonne DIDO: ${columnName}`)
  }
  return energyType
}
