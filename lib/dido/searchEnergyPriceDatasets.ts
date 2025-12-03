import { DIDO_API_BASE_URL, type DidoDataset } from "./didoConstants"

/**
 * Recherche les datasets liés aux prix de l'énergie
 */
export const searchEnergyPriceDatasets = async (): Promise<DidoDataset[]> => {
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
