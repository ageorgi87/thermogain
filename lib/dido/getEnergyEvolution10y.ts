import { DATAFILE_RIDS } from "./didoConstants"
import { calculateEnergyEvolution10y } from "./helpers/calculateEnergyEvolution10y"

/**
 * Récupère l'évolution sur 10 ans pour un type d'énergie spécifique
 * Utilisé par le système de cache pour mettre à jour les prix
 */
export const getEnergyEvolution10y = async (energyType: string): Promise<number> => {
  const defaultEvolution = 3 // 3% par an par défaut

  try {
    switch (energyType) {
      case "fioul":
      case "gpl":
        return await calculateEnergyEvolution10y(DATAFILE_RIDS.petroleum, "PX_PETRO_FOD_100KWH_C1")
      case "gaz":
        return await calculateEnergyEvolution10y(DATAFILE_RIDS.gas, "PX_GAZ_D_TTES_TRANCHES")
      case "bois":
        return await calculateEnergyEvolution10y(DATAFILE_RIDS.wood, "PX_BOIS_GRANVRAC_100KWH")
      case "electricite":
        return await calculateEnergyEvolution10y(DATAFILE_RIDS.electricity, "PX_ELE_D_TTES_TRANCHES")
      default:
        return defaultEvolution
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'évolution pour ${energyType}:`, error)
    return defaultEvolution
  }
}
