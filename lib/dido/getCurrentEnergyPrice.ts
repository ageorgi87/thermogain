import { DATAFILE_RIDS } from "./didoConstants"
import { getDataFileRows } from "./getDataFileRows"

/**
 * Récupère le prix actuel moyen d'une énergie depuis l'API DIDO
 * Le prix est calculé comme la moyenne des 12 derniers mois disponibles
 */
export const getCurrentEnergyPrice = async (energyType: string): Promise<number> => {
  // Valeurs par défaut (prix moyens en €/kWh)
  const defaultPrices: Record<string, number> = {
    fioul: 0.115,      // ~1.15 €/L / 10 kWh
    gaz: 0.10,         // 0.10 €/kWh
    gpl: 0.125,        // ~1.60 €/kg / 12.8 kWh
    bois: 0.055,       // ~100 €/stère / 1800 kWh
    electricite: 0.2516, // Tarif régulé moyen 2024
  }

  try {
    let rid: string
    let columnName: string

    switch (energyType) {
      case "fioul":
      case "gpl":
        rid = DATAFILE_RIDS.petroleum
        columnName = "PX_PETRO_FOD_100KWH_C1" // Prix pour 100 kWh
        break
      case "gaz":
        rid = DATAFILE_RIDS.gas
        columnName = "PX_GAZ_D_TTES_TRANCHES" // Prix pour 100 kWh
        break
      case "bois":
        rid = DATAFILE_RIDS.wood
        columnName = "PX_BOIS_GRANVRAC_100KWH" // Prix pour 100 kWh
        break
      case "electricite":
        rid = DATAFILE_RIDS.electricity
        columnName = "PX_ELE_D_TTES_TRANCHES" // Prix pour 100 kWh
        break
      default:
        return defaultPrices[energyType] || 0.20
    }

    // Récupérer les 12 derniers mois
    const rows = await getDataFileRows(rid, 12)

    if (rows.length === 0) {
      console.warn(`Pas de données disponibles pour ${energyType}, utilisation valeur par défaut`)
      return defaultPrices[energyType] || 0.20
    }

    // Extraire les prix et calculer la moyenne
    const prices: number[] = rows
      .map((row: any) => parseFloat(row[columnName]))
      .filter((price: number) => !isNaN(price) && price > 0)

    if (prices.length === 0) {
      console.warn(`Pas de prix valides pour ${energyType}, utilisation valeur par défaut`)
      return defaultPrices[energyType] || 0.20
    }

    // Calculer la moyenne des prix des 12 derniers mois
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length

    // Les prix dans l'API sont en €/100kWh, donc diviser par 100 pour avoir €/kWh
    const pricePerKwh = averagePrice / 100

    console.log(`Prix moyen ${energyType}: ${pricePerKwh.toFixed(4)} €/kWh`)

    // Arrondir à 4 décimales
    return Math.round(pricePerKwh * 10000) / 10000
  } catch (error) {
    console.error(`Erreur lors de la récupération du prix pour ${energyType}:`, error)
    return defaultPrices[energyType] || 0.20
  }
}
