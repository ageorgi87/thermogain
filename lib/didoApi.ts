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

interface EnergyEvolutionPeriods {
  evolution_1y: number
  evolution_5y: number
  evolution_10y: number
  evolution_weighted: number
}

/**
 * Récupère et calcule le taux d'évolution annuel moyen pour un type d'énergie
 * sur plusieurs périodes (1 an, 5 ans, 10 ans) et retourne toutes les valeurs
 */
async function calculateEnergyEvolution(rid: string, priceColumnName: string): Promise<EnergyEvolutionPeriods> {
  try {
    // Récupérer 120 lignes (10 ans de données mensuelles)
    const rows = await getDataFileRows(rid, 120)

    if (rows.length < 12) {
      console.warn(`Pas assez de données pour ${priceColumnName}`)
      return { evolution_1y: 0, evolution_5y: 0, evolution_10y: 0, evolution_weighted: 0 }
    }

    // Extraire les prix mensuels (du plus récent au plus ancien)
    const prices: number[] = rows
      .map((row: any) => parseFloat(row[priceColumnName]))
      .filter((price: number) => !isNaN(price) && price > 0)

    if (prices.length < 12) {
      console.warn(`Pas assez de prix valides pour ${priceColumnName} (${prices.length} trouvés)`)
      return { evolution_1y: 0, evolution_5y: 0, evolution_10y: 0, evolution_weighted: 0 }
    }

    const evolutions: { period: string; rate: number; weight: number }[] = []
    let evolution_1y = 0
    let evolution_5y = 0
    let evolution_10y = 0

    // 1 an (12 derniers mois vs 12 mois précédents)
    if (prices.length >= 24) {
      const recent12 = prices.slice(0, 12)
      const previous12 = prices.slice(12, 24)
      const avgRecent = recent12.reduce((a, b) => a + b, 0) / 12
      const avgPrevious = previous12.reduce((a, b) => a + b, 0) / 12
      if (avgPrevious > 0) {
        evolution_1y = ((avgRecent - avgPrevious) / avgPrevious) * 100
        evolutions.push({ period: "1 an", rate: evolution_1y, weight: 0.5 }) // Poids 50%
      }
    }

    // 5 ans (moyennes glissantes)
    if (prices.length >= 60) {
      const recent = prices.slice(0, 12).reduce((a, b) => a + b, 0) / 12
      const old = prices.slice(48, 60).reduce((a, b) => a + b, 0) / 12
      if (old > 0) {
        const totalEvolution = ((recent - old) / old) * 100
        evolution_5y = totalEvolution / 5 // Annualisé
        evolutions.push({ period: "5 ans", rate: evolution_5y, weight: 0.3 }) // Poids 30%
      }
    }

    // 10 ans (moyennes glissantes)
    if (prices.length >= 120) {
      const recent = prices.slice(0, 12).reduce((a, b) => a + b, 0) / 12
      const old = prices.slice(108, 120).reduce((a, b) => a + b, 0) / 12
      if (old > 0) {
        const totalEvolution = ((recent - old) / old) * 100
        evolution_10y = totalEvolution / 10 // Annualisé
        evolutions.push({ period: "10 ans", rate: evolution_10y, weight: 0.2 }) // Poids 20%
      }
    }

    if (evolutions.length === 0) {
      console.warn(`Impossible de calculer l'évolution pour ${priceColumnName}`)
      return { evolution_1y: 0, evolution_5y: 0, evolution_10y: 0, evolution_weighted: 0 }
    }

    // Calculer la moyenne pondérée (50% 1an, 30% 5ans, 20% 10ans)
    const totalWeight = evolutions.reduce((sum, e) => sum + e.weight, 0)
    const weightedAverage = evolutions.reduce((sum, e) => sum + (e.rate * e.weight), 0) / totalWeight

    // Arrondir à 1 décimale
    return {
      evolution_1y: Math.round(evolution_1y * 10) / 10,
      evolution_5y: Math.round(evolution_5y * 10) / 10,
      evolution_10y: Math.round(evolution_10y * 10) / 10,
      evolution_weighted: Math.round(weightedAverage * 10) / 10,
    }
  } catch (error) {
    console.error(`Erreur lors du calcul de l'évolution pour ${priceColumnName}:`, error)
    return { evolution_1y: 0, evolution_5y: 0, evolution_10y: 0, evolution_weighted: 0 }
  }
}

/**
 * Récupère les taux d'évolution des prix de l'énergie depuis l'API DIDO
 *
 * Cette fonction interroge l'API DIDO-SDES pour obtenir les données historiques
 * des prix de l'énergie et calcule les taux d'évolution annuels moyens.
 *
 * En cas d'échec de l'API, des valeurs par défaut basées sur les moyennes historiques sont retournées.
 */
export async function getEnergyPriceEvolutions(): Promise<EnergyPriceEvolution> {
  // Valeurs par défaut basées sur les moyennes historiques (2000-2024)
  const defaultValues: EnergyPriceEvolution = {
    evolution_prix_fioul: 3,
    evolution_prix_gaz: 4,
    evolution_prix_gpl: 3,
    evolution_prix_bois: 2,
    evolution_prix_electricite: 3,
  }

  try {

    // Calculer les évolutions pour chaque type d'énergie en parallèle
    const [fioul, gaz, bois, electricite] = await Promise.all([
      calculateEnergyEvolution(DATAFILE_RIDS.petroleum, "PX_PETRO_FOD_100KWH_C1"),  // Prix fioul domestique
      calculateEnergyEvolution(DATAFILE_RIDS.gas, "PX_GAZ_D_TTES_TRANCHES"),        // Prix gaz toutes tranches
      calculateEnergyEvolution(DATAFILE_RIDS.wood, "PX_BOIS_GRANVRAC_100KWH"),      // Prix bois granulés vrac
      calculateEnergyEvolution(DATAFILE_RIDS.electricity, "PX_ELE_D_TTES_TRANCHES"), // Prix électricité toutes tranches
    ])

    // GPL utilise les mêmes données que le pétrole (approximation)
    return {
      evolution_prix_fioul: fioul.evolution_weighted || defaultValues.evolution_prix_fioul,
      evolution_prix_gaz: gaz.evolution_weighted || defaultValues.evolution_prix_gaz,
      evolution_prix_gpl: fioul.evolution_weighted || defaultValues.evolution_prix_gpl,  // Approximation
      evolution_prix_bois: bois.evolution_weighted || defaultValues.evolution_prix_bois,
      evolution_prix_electricite: electricite.evolution_weighted || defaultValues.evolution_prix_electricite,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des évolutions de prix:", error)
    return defaultValues
  }
}

/**
 * Récupère les détails complets des évolutions de prix (incluant toutes les périodes)
 * pour un type d'énergie spécifique
 */
export async function getEnergyEvolutionDetails(energyType: string): Promise<EnergyEvolutionPeriods> {
  const defaultPeriods: EnergyEvolutionPeriods = {
    evolution_1y: 0,
    evolution_5y: 0,
    evolution_10y: 0,
    evolution_weighted: 0,
  }

  try {
    switch (energyType) {
      case "fioul":
      case "gpl":
        return await calculateEnergyEvolution(DATAFILE_RIDS.petroleum, "PX_PETRO_FOD_100KWH_C1")
      case "gaz":
        return await calculateEnergyEvolution(DATAFILE_RIDS.gas, "PX_GAZ_D_TTES_TRANCHES")
      case "bois":
        return await calculateEnergyEvolution(DATAFILE_RIDS.wood, "PX_BOIS_GRANVRAC_100KWH")
      case "electricite":
        return await calculateEnergyEvolution(DATAFILE_RIDS.electricity, "PX_ELE_D_TTES_TRANCHES")
      default:
        return defaultPeriods
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails pour ${energyType}:`, error)
    return defaultPeriods
  }
}
