import { DIDO_API_BASE_URL } from "@/app/(main)/[projectId]/(step)/(content)/informations/config/didoApiBaseUrl"

/**
 * Récupère les données mensuelles de prix énergétiques depuis l'API DIDO
 *
 * @param rid Identifiant du datafile DIDO
 * @param limit Nombre maximum de lignes à récupérer (par défaut 100)
 * @returns Tableau de données mensuelles de prix énergétiques
 */
export const getDidoMonthlyEnergyPriceData = async (rid: string, limit: number = 100): Promise<any[]> => {
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
    const didoMonthlyEnergyPriceData = Array.isArray(data) ? data : (data.data || [])
    return didoMonthlyEnergyPriceData.slice(0, limit)
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error)
    return []
  }
}
