/**
 * Client pour l'API DIDO - SDES (Service des Données et Études Statistiques)
 * Documentation: https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/apidoc.html
 *
 * Dataset: Conjoncture mensuelle de l'énergie
 * ID: 631b03afb61e5c6479370169
 */

const DIDO_API_BASE_URL = "https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1"

// RIDs des fichiers de données de prix pour les ménages (nov 2025)
const DATAFILE_RIDS = {
  petroleum: "daf4715a-0795-4098-bdb1-d90b6e6a568d",  // 1.1 Prix pétrole ménages
  electricity: "cd28227c-bc1e-401b-8d42-3073497c2973", // 1.2 Prix électricité ménages
  gas: "9bb3b4e5-91e7-4ee5-95d9-aef38471ee75",        // 1.3 Prix gaz ménages
  wood: "0bf930dc-bfac-4e6f-a063-ec1774c6d029",       // 1.4 Prix bois ménages
}

interface DidoDataset {
  id: string
  title: string
  description: string
  topics: string[]
}

interface DidoDataFile {
  rid: string
  millesime: string
  datasetId: string
}

interface EnergyPriceEvolution {
  evolution_prix_fioul: number
  evolution_prix_gaz: number
  evolution_prix_gpl: number
  evolution_prix_bois: number
  evolution_prix_electricite: number
}

/**
 * Recherche les datasets liés aux prix de l'énergie
 */
export async function searchEnergyPriceDatasets(): Promise<DidoDataset[]> {
  try {
    const response = await fetch(
      `${DIDO_API_BASE_URL}/datasets?topics=Énergie&pageSize=100`
    )

    if (!response.ok) {
      throw new Error(`Erreur API DIDO: ${response.statusText}`)
    }

    const data = await response.json()

    // Filtrer les datasets qui contiennent "prix" dans leur titre ou description
    return data.data.filter((dataset: DidoDataset) => {
      const searchText = `${dataset.title} ${dataset.description}`.toLowerCase()
      return searchText.includes("prix") &&
             (searchText.includes("mensuel") || searchText.includes("mensuelle"))
    })
  } catch (error) {
    console.error("Erreur lors de la recherche des datasets:", error)
    return []
  }
}

/**
 * Récupère les fichiers de données pour un dataset donné
 */
export async function getDataFiles(datasetId: string): Promise<DidoDataFile[]> {
  try {
    const response = await fetch(
      `${DIDO_API_BASE_URL}/datafiles?datasetId=${datasetId}&pageSize=100`
    )

    if (!response.ok) {
      throw new Error(`Erreur API DIDO: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers:", error)
    return []
  }
}

/**
 * Récupère les données d'un fichier spécifique en format CSV et les convertit en JSON
 */
export async function getDataFileRows(rid: string, limit: number = 100): Promise<any[]> {
  try {
    // Essayer d'abord l'endpoint JSON
    let response = await fetch(
      `${DIDO_API_BASE_URL}/datafiles/${rid}/json`
    )

    if (!response.ok) {
      throw new Error(`Erreur API DIDO: ${response.statusText}`)
    }

    const data = await response.json()

    // Limiter le nombre de lignes
    const rows = Array.isArray(data) ? data : (data.data || [])
    return rows.slice(0, limit)
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error)
    return []
  }
}

/**
 * Calcule le taux d'évolution annuel moyen à partir de données historiques
 */
function calculateAverageAnnualEvolution(prices: number[]): number {
  if (prices.length < 2) return 0

  // Calculer les variations annuelles
  const annualChanges: number[] = []
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      const change = ((prices[i] - prices[i - 1]) / prices[i - 1]) * 100
      annualChanges.push(change)
    }
  }

  // Calculer la moyenne des variations
  if (annualChanges.length === 0) return 0
  const average = annualChanges.reduce((sum, val) => sum + val, 0) / annualChanges.length

  // Arrondir à 1 décimale
  return Math.round(average * 10) / 10
}

/**
 * Calcule le taux d'évolution annuel moyen sur 10 ans pour un type d'énergie
 * Utilise les moyennes glissantes des 12 derniers mois vs il y a 10 ans
 * Aligné avec l'horizon d'investissement de 17 ans d'une PAC
 */
async function calculateEnergyEvolution10y(rid: string, priceColumnName: string): Promise<number> {
  try {
    // Récupérer 120 lignes (10 ans de données mensuelles)
    const rows = await getDataFileRows(rid, 120)

    if (rows.length < 120) {
      console.warn(`Pas assez de données pour calculer l'évolution sur 10 ans pour ${priceColumnName} (${rows.length}/120)`)
      return 0
    }

    // Extraire les prix mensuels (du plus récent au plus ancien)
    const prices: number[] = rows
      .map((row: any) => parseFloat(row[priceColumnName]))
      .filter((price: number) => !isNaN(price) && price > 0)

    if (prices.length < 120) {
      console.warn(`Pas assez de prix valides pour ${priceColumnName} (${prices.length}/120 trouvés)`)
      return 0
    }

    // Calculer l'évolution sur 10 ans (moyennes glissantes)
    const recentAvg = prices.slice(0, 12).reduce((a, b) => a + b, 0) / 12
    const oldAvg = prices.slice(108, 120).reduce((a, b) => a + b, 0) / 12

    if (oldAvg <= 0) {
      console.warn(`Prix moyen historique invalide pour ${priceColumnName}`)
      return 0
    }

    // Taux d'évolution total sur 10 ans, puis annualisé
    const totalEvolution = ((recentAvg - oldAvg) / oldAvg) * 100
    const annualizedEvolution = totalEvolution / 10

    // Arrondir à 1 décimale
    return Math.round(annualizedEvolution * 10) / 10
  } catch (error) {
    console.error(`Erreur lors du calcul de l'évolution pour ${priceColumnName}:`, error)
    return 0
  }
}

/**
 * Récupère les taux d'évolution des prix de l'énergie depuis l'API DIDO
 * Calcule l'évolution sur 10 ans, alignée avec l'horizon d'investissement d'une PAC (17 ans)
 *
 * Cette fonction interroge l'API DIDO-SDES pour obtenir les données historiques
 * des prix de l'énergie et calcule les taux d'évolution annuels moyens sur 10 ans.
 *
 * En cas d'échec de l'API, des valeurs par défaut basées sur les moyennes historiques sont retournées.
 */
export async function getEnergyPriceEvolutions(): Promise<EnergyPriceEvolution> {
  // Valeurs par défaut basées sur les moyennes historiques 2014-2024 (10 ans)
  const defaultValues: EnergyPriceEvolution = {
    evolution_prix_fioul: 3,
    evolution_prix_gaz: 4,
    evolution_prix_gpl: 3,
    evolution_prix_bois: 2,
    evolution_prix_electricite: 3,
  }

  try {
    // Calculer les évolutions sur 10 ans pour chaque type d'énergie en parallèle
    const [fioul, gaz, bois, electricite] = await Promise.all([
      calculateEnergyEvolution10y(DATAFILE_RIDS.petroleum, "PX_PETRO_FOD_100KWH_C1"),  // Prix fioul domestique
      calculateEnergyEvolution10y(DATAFILE_RIDS.gas, "PX_GAZ_D_TTES_TRANCHES"),        // Prix gaz toutes tranches
      calculateEnergyEvolution10y(DATAFILE_RIDS.wood, "PX_BOIS_GRANVRAC_100KWH"),      // Prix bois granulés vrac
      calculateEnergyEvolution10y(DATAFILE_RIDS.electricity, "PX_ELE_D_TTES_TRANCHES"), // Prix électricité toutes tranches
    ])

    // GPL utilise les mêmes données que le pétrole (approximation)
    return {
      evolution_prix_fioul: fioul || defaultValues.evolution_prix_fioul,
      evolution_prix_gaz: gaz || defaultValues.evolution_prix_gaz,
      evolution_prix_gpl: fioul || defaultValues.evolution_prix_gpl,  // Approximation
      evolution_prix_bois: bois || defaultValues.evolution_prix_bois,
      evolution_prix_electricite: electricite || defaultValues.evolution_prix_electricite,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des évolutions de prix:", error)
    return defaultValues
  }
}

/**
 * Récupère le prix actuel moyen d'une énergie depuis l'API DIDO
 * Le prix est calculé comme la moyenne des 12 derniers mois disponibles
 */
export async function getCurrentEnergyPrice(energyType: string): Promise<number> {
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

/**
 * Récupère l'évolution sur 10 ans pour un type d'énergie spécifique
 * Utilisé par le système de cache pour mettre à jour les prix
 */
export async function getEnergyEvolution10y(energyType: string): Promise<number> {
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
