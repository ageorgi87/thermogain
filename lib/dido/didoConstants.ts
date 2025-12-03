/**
 * Constantes pour l'API DIDO - SDES (Service des Données et Études Statistiques)
 * Documentation: https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/apidoc.html
 */

export const DIDO_API_BASE_URL = "https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1"

// RIDs des fichiers de données de prix pour les ménages (nov 2025)
export const DATAFILE_RIDS = {
  petroleum: "daf4715a-0795-4098-bdb1-d90b6e6a568d",  // 1.1 Prix pétrole ménages
  electricity: "cd28227c-bc1e-401b-8d42-3073497c2973", // 1.2 Prix électricité ménages
  gas: "9bb3b4e5-91e7-4ee5-95d9-aef38471ee75",        // 1.3 Prix gaz ménages
  wood: "0bf930dc-bfac-4e6f-a063-ec1774c6d029",       // 1.4 Prix bois ménages
}

export interface DidoDataset {
  id: string
  title: string
  description: string
  topics: string[]
}

export interface DidoDataFile {
  rid: string
  millesime: string
  datasetId: string
}

export interface EnergyPriceEvolution {
  evolution_prix_fioul: number
  evolution_prix_gaz: number
  evolution_prix_gpl: number
  evolution_prix_bois: number
  evolution_prix_electricite: number
}
