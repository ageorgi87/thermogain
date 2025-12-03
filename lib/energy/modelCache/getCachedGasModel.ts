import type { EnergyEvolutionModel } from "@/lib/energyEvolution/energyEvolutionData"
import { getEnergyMeanReversionModel } from "@/lib/energyEvolution/models/getEnergyMeanReversionModel"
import { getModelFromDb } from "./helpers/getModelFromDb"
import { saveModelToDb } from "./helpers/saveModelToDb"
import { memoryCache, CACHE_DURATION } from "./helpers/memoryCache"

/**
 * Récupère le modèle gaz avec cache (DB + mémoire)
 */
export const getCachedGasModel = async (): Promise<EnergyEvolutionModel> => {
  const key = 'gaz'

  // 1. Vérifier le cache mémoire (ultra rapide)
  if (memoryCache[key] && Date.now() - memoryCache[key].timestamp < CACHE_DURATION) {
    console.log('✅ Modèle GAZ depuis cache mémoire')
    return memoryCache[key].model
  }

  // 2. Vérifier la base de données
  const dbModel = await getModelFromDb('gaz')
  if (dbModel) {
    // Mettre en cache mémoire pour les prochains appels
    memoryCache[key] = {
      model: dbModel,
      timestamp: Date.now()
    }
    return dbModel
  }

  // 3. Appeler l'API DIDO
  console.log('🌐 Récupération modèle GAZ depuis API DIDO...')
  const model = await getEnergyMeanReversionModel('gaz')

  // Sauvegarder en DB et en mémoire
  await saveModelToDb('gaz', model)
  memoryCache[key] = {
    model,
    timestamp: Date.now()
  }

  return model
}
