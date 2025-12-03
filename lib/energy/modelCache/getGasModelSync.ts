import type { EnergyEvolutionModel } from "@/lib/energyPriceEvolution"
import { DEFAULT_GAS_MODEL } from "@/lib/energyPriceEvolution"
import { getCachedGasModel } from "./getCachedGasModel"
import { memoryCache, CACHE_DURATION } from "./helpers/memoryCache"

/**
 * Récupère le modèle gaz de manière SYNCHRONE
 * Utilise le cache mémoire si disponible, sinon retourne les valeurs par défaut
 * et lance le chargement en arrière-plan
 */
export const getGasModelSync = (): EnergyEvolutionModel => {
  const key = 'gaz'

  if (memoryCache[key] && Date.now() - memoryCache[key].timestamp < CACHE_DURATION) {
    return memoryCache[key].model
  }

  // Pas en cache mémoire: lancer le chargement en arrière-plan (DB -> API)
  getCachedGasModel().catch(err => console.error('Erreur chargement modèle gaz:', err))

  // Retourner valeurs par défaut en attendant
  return DEFAULT_GAS_MODEL
}
