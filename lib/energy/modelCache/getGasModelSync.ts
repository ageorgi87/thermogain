import type { EnergyEvolutionModel } from "@/lib/energyEvolution/energyEvolutionData"
import { getCachedGasModel } from "./getCachedGasModel"
import { memoryCache, CACHE_DURATION } from "./helpers/memoryCache"

/**
 * Récupère le modèle gaz de manière SYNCHRONE
 *
 * @returns Modèle d'évolution du gaz depuis le cache mémoire
 * @throws Error si le cache n'est pas initialisé
 *
 * IMPORTANT: Ce cache doit être pré-chargé au démarrage de l'application.
 * Si cette fonction throw, c'est un bug - le cache aurait dû être initialisé.
 */
export const getGasModelSync = (): EnergyEvolutionModel => {
  const key = 'gaz'

  if (memoryCache[key] && Date.now() - memoryCache[key].timestamp < CACHE_DURATION) {
    return memoryCache[key].model
  }

  // Lancer le chargement en arrière-plan pour les prochains appels
  getCachedGasModel().catch(err => console.error('Erreur chargement modèle gaz:', err))

  throw new Error('Cache du modèle gaz non initialisé. Veuillez appeler getCachedGasModel() au démarrage de l\'application.')
}
