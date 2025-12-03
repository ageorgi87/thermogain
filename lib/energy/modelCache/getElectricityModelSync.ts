import type { EnergyEvolutionModel } from "@/lib/energyEvolution/energyEvolutionData"
import { DEFAULT_ELECTRICITY_MODEL } from "@/lib/energyEvolution/energyEvolutionData"
import { getCachedElectricityModel } from "./getCachedElectricityModel"
import { memoryCache, CACHE_DURATION } from "./helpers/memoryCache"

/**
 * Récupère le modèle électricité de manière SYNCHRONE
 */
export const getElectricityModelSync = (): EnergyEvolutionModel => {
  const key = 'electricite'

  if (memoryCache[key] && Date.now() - memoryCache[key].timestamp < CACHE_DURATION) {
    return memoryCache[key].model
  }

  getCachedElectricityModel().catch(err => console.error('Erreur chargement modèle électricité:', err))
  return DEFAULT_ELECTRICITY_MODEL
}
