import type { EnergyEvolutionModel } from "@/lib/energyPriceEvolution"
import { DEFAULT_GAS_MODEL, DEFAULT_ELECTRICITY_MODEL } from "@/lib/energyPriceEvolution"
import { getCachedEnergyModel } from "./getCachedEnergyModel"
import { memoryCache, CACHE_DURATION } from "./helpers/memoryCache"

/**
 * Récupère un modèle énergétique de manière SYNCHRONE
 */
export const getEnergyModelSync = (
  energyType: 'gaz' | 'electricite' | 'fioul' | 'bois'
): EnergyEvolutionModel => {
  const key = energyType

  if (memoryCache[key] && Date.now() - memoryCache[key].timestamp < CACHE_DURATION) {
    return memoryCache[key].model
  }

  // Lancer le chargement en arrière-plan
  getCachedEnergyModel(energyType).catch(err =>
    console.error(`Erreur chargement modèle ${energyType}:`, err)
  )

  // Retourner valeurs par défaut selon le type
  switch (energyType) {
    case 'gaz':
      return DEFAULT_GAS_MODEL
    case 'electricite':
      return DEFAULT_ELECTRICITY_MODEL
    case 'fioul':
      return { type: 'mean-reversion', tauxRecent: 7.2, tauxEquilibre: 2.5, anneesTransition: 5 }
    case 'bois':
      return { type: 'mean-reversion', tauxRecent: 3.4, tauxEquilibre: 2.0, anneesTransition: 5 }
  }
}
