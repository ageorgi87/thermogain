import { getCachedGasModel } from "./getCachedGasModel"
import { getCachedElectricityModel } from "./getCachedElectricityModel"
import { getCachedEnergyModel } from "./getCachedEnergyModel"
import { isPreloading, setIsPreloading } from "./helpers/memoryCache"

/**
 * Récupère tous les modèles en une seule fois (optimisation)
 * Utilise le cache si disponible, sinon appelle l'API en parallèle
 */
export const preloadAllModels = async (): Promise<void> => {
  if (isPreloading) {
    console.log('⏳ Pré-chargement déjà en cours...')
    return
  }

  setIsPreloading(true)
  console.log('📦 Pré-chargement des modèles (DB -> API si nécessaire)...')

  try {
    await Promise.all([
      getCachedGasModel(),
      getCachedElectricityModel(),
      getCachedEnergyModel('fioul'),
      getCachedEnergyModel('bois')
    ])

    console.log('✅ Tous les modèles sont disponibles')
  } catch (error) {
    console.error('❌ Erreur lors du pré-chargement des modèles:', error)
    // Ne pas rejeter l'erreur - l'app doit continuer avec les valeurs par défaut
  } finally {
    setIsPreloading(false)
  }
}
