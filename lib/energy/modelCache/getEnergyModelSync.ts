import type { EnergyEvolutionModel } from "@/lib/energyEvolution/energyEvolutionData"
import { getCachedEnergyModel } from "./getCachedEnergyModel"
import { memoryCache, CACHE_DURATION } from "./helpers/memoryCache"

/**
 * Récupère un modèle énergétique de manière SYNCHRONE
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', 'bois')
 * @returns Modèle d'évolution depuis le cache mémoire
 * @throws Error si le cache n'est pas initialisé
 *
 * IMPORTANT: Ce cache doit être pré-chargé au démarrage de l'application.
 * Si cette fonction throw, c'est un bug - le cache aurait dû être initialisé.
 */
export const getEnergyModelSync = (
  energyType: 'gaz' | 'electricite' | 'fioul' | 'bois'
): EnergyEvolutionModel => {
  const key = energyType

  if (memoryCache[key] && Date.now() - memoryCache[key].timestamp < CACHE_DURATION) {
    return memoryCache[key].model
  }

  // Lancer le chargement en arrière-plan pour les prochains appels
  getCachedEnergyModel(energyType).catch(err =>
    console.error(`Erreur chargement modèle ${energyType}:`, err)
  )

  throw new Error(`Cache du modèle ${energyType} non initialisé. Veuillez appeler getCachedEnergyModel('${energyType}') au démarrage de l'application.`)
}
