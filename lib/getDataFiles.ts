import { DIDO_API_BASE_URL, type DidoDataFile } from "@/lib/didoConstants"

/**
 * Récupère les fichiers de données pour un dataset donné
 */
export const getDataFiles = async (datasetId: string): Promise<DidoDataFile[]> => {
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
