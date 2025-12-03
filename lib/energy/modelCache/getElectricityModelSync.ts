import type { EnergyEvolutionModel } from "@/lib/energyEvolution/energyEvolutionData"
import { getCachedElectricityModel } from "./getCachedElectricityModel"
import { memoryCache, CACHE_DURATION } from "./helpers/memoryCache"

/**
 * Récupère le modèle électricité de manière SYNCHRONE
 *
 * @returns Modèle d'évolution de l'électricité depuis le cache mémoire
 * @throws Error si le cache n'est pas initialisé
 *
 * IMPORTANT: Ce cache doit être pré-chargé au démarrage de l'application.
 * Si cette fonction throw, c'est un bug - le cache aurait dû être initialisé.
 */
export const getElectricityModelSync = (): EnergyEvolutionModel => {
  const key = 'electricite'

  if (memoryCache[key] && Date.now() - memoryCache[key].timestamp < CACHE_DURATION) {
    return memoryCache[key].model
  }

  // Lancer le chargement en arrière-plan pour les prochains appels
  getCachedElectricityModel().catch(err => console.error('Erreur chargement modèle électricité:', err))

  throw new Error('Cache du modèle électricité non initialisé. Veuillez appeler getCachedElectricityModel() au démarrage de l\'application.')
}
