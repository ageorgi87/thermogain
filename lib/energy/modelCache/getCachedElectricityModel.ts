import type { EnergyEvolutionModel } from "@/lib/energyPriceEvolution"
import { getElectricityMeanReversionModel } from "@/lib/energyPriceEvolutionModels"
import { getModelFromDb } from "./helpers/getModelFromDb"
import { saveModelToDb } from "./helpers/saveModelToDb"
import { memoryCache, CACHE_DURATION } from "./helpers/memoryCache"

/**
 * Récupère le modèle électricité avec cache (DB + mémoire)
 */
export const getCachedElectricityModel = async (): Promise<EnergyEvolutionModel> => {
  const key = 'electricite'

  // 1. Cache mémoire
  if (memoryCache[key] && Date.now() - memoryCache[key].timestamp < CACHE_DURATION) {
    console.log('✅ Modèle ÉLECTRICITÉ depuis cache mémoire')
    return memoryCache[key].model
  }

  // 2. Base de données
  const dbModel = await getModelFromDb('electricite')
  if (dbModel) {
    memoryCache[key] = {
      model: dbModel,
      timestamp: Date.now()
    }
    return dbModel
  }

  // 3. API DIDO
  console.log('🌐 Récupération modèle ÉLECTRICITÉ depuis API DIDO...')
  const model = await getElectricityMeanReversionModel()

  await saveModelToDb('electricite', model)
  memoryCache[key] = {
    model,
    timestamp: Date.now()
  }

  return model
}
