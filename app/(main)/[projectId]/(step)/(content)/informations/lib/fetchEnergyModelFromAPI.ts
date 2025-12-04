import type { EnergyEvolutionModel } from "@/types/energy"
import { DATAFILE_RIDS } from "@/app/(main)/[projectId]/lib/energy/didoConstants"
import { analyzeEnergyPriceHistory } from "@/app/(main)/[projectId]/lib/calculateAllResults/analyzeEnergyPriceHistory"
import { getDataFileRows } from "@/app/(main)/[projectId]/lib/energy/getDataFileRows"

/**
 * Calcule le prix actuel moyen d'une énergie (moyenne des 12 derniers mois)
 * depuis l'API DIDO
 *
 * @param rid Identifiant du datafile DIDO
 * @param priceColumnName Nom de la colonne contenant le prix
 * @param energyType Type d'énergie
 * @returns Prix moyen en €/kWh
 * @throws Error si les données ne sont pas disponibles
 */
const calculateCurrentPrice = async (
  rid: string,
  priceColumnName: string,
  energyType: string
): Promise<number> => {
  // Récupérer les 12 derniers mois
  const rows = await getDataFileRows(rid, 12)

  if (rows.length === 0) {
    throw new Error(`Aucune donnée de prix disponible pour ${energyType} depuis l'API DIDO`)
  }

  // Extraire les prix et calculer la moyenne
  const prices: number[] = rows
    .map((row: any) => parseFloat(row[priceColumnName]))
    .filter((price: number) => !isNaN(price) && price > 0)

  if (prices.length === 0) {
    throw new Error(`Aucun prix valide trouvé pour ${energyType} dans les données DIDO`)
  }

  // Calculer la moyenne des prix des 12 derniers mois
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length

  // Les prix dans l'API sont en €/100kWh, donc diviser par 100 pour avoir €/kWh
  const pricePerKwh = averagePrice / 100

  console.log(`💰 Prix moyen ${energyType}: ${pricePerKwh.toFixed(4)} €/kWh`)

  // Arrondir à 4 décimales
  return Math.round(pricePerKwh * 10000) / 10000
}

/**
 * Génère le modèle Mean Reversion pour un type d'énergie donné
 * basé sur l'historique réel de l'API DIDO
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', 'bois')
 * @returns Modèle Mean Reversion optimal calculé depuis l'API DIDO
 * @throws Error si le type d'énergie est invalide ou si l'API échoue
 */
export const fetchEnergyModelFromAPI = async (
  energyType: "gaz" | "electricite" | "fioul" | "bois"
): Promise<EnergyEvolutionModel> => {
  let rid: string
  let priceColumnName: string

  switch (energyType) {
    case "gaz":
      rid = DATAFILE_RIDS.gas
      priceColumnName = "PX_GAZ_D_TTES_TRANCHES"
      break

    case "electricite":
      rid = DATAFILE_RIDS.electricity
      priceColumnName = "PX_ELE_D_TTES_TRANCHES"
      break

    case "fioul":
      rid = DATAFILE_RIDS.petroleum
      priceColumnName = "PX_PETRO_FOD_100KWH_C1"
      break

    case "bois":
      rid = DATAFILE_RIDS.wood
      priceColumnName = "PX_BOIS_GRANVRAC_100KWH"
      break

    default:
      throw new Error(`Type d'énergie invalide: ${energyType}`)
  }

  const analysis = await analyzeEnergyPriceHistory(rid, priceColumnName)
  const currentPrice = await calculateCurrentPrice(rid, priceColumnName, energyType)

  return {
    tauxRecent: analysis.tauxRecent,
    tauxEquilibre: analysis.tauxEquilibre,
    anneesTransition: 5,
    currentPrice,
  }
}
