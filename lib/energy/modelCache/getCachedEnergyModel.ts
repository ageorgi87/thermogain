import type { EnergyEvolutionModel } from "@/lib/energyPriceEvolution"
import { getEnergyMeanReversionModel } from "@/lib/energyPriceEvolutionModels"
import { getModelFromDb } from "./helpers/getModelFromDb"
import { saveModelToDb } from "./helpers/saveModelToDb"
import { memoryCache, CACHE_DURATION } from "./helpers/memoryCache"

/**
 * Récupère un modèle générique avec cache (DB + mémoire)
 */
export const getCachedEnergyModel = async (
  energyType: 'gaz' | 'electricite' | 'fioul' | 'bois'
): Promise<EnergyEvolutionModel> => {
  const key = energyType

  // 1. Cache mémoire
  if (memoryCache[key] && Date.now() - memoryCache[key].timestamp < CACHE_DURATION) {
    console.log(`✅ Modèle ${energyType.toUpperCase()} depuis cache mémoire`)
    return memoryCache[key].model
  }

  // 2. Base de données
  const dbModel = await getModelFromDb(energyType)
  if (dbModel) {
    memoryCache[key] = {
      model: dbModel,
      timestamp: Date.now()
    }
    return dbModel
  }

  // 3. API DIDO
  console.log(`🌐 Récupération modèle ${energyType.toUpperCase()} depuis API DIDO...`)
  const model = await getEnergyMeanReversionModel(energyType)

  await saveModelToDb(energyType, model)
  memoryCache[key] = {
    model,
    timestamp: Date.now()
  }

  return model
}
