import { DIDO_API_BASE_URL } from "@/app/(main)/[projectId]/lib/didoConstants"

/**
 * Récupère les données d'un fichier spécifique en format CSV et les convertit en JSON
 */
export const getDataFileRows = async (rid: string, limit: number = 100): Promise<any[]> => {
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
