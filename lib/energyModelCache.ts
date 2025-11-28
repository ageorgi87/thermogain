/**
 * Cache des modèles Mean Reversion pour éviter de rappeler l'API DIDO à chaque calcul
 *
 * Les modèles sont mis en cache pendant 24h car ils ne changent que mensuellement
 * (nouvelles données DIDO publiées une fois par mois)
 *
 * IMPORTANT: Ce système fonctionne de manière synchrone avec fallback sur valeurs
 * par défaut. Les modèles sont pré-chargés au démarrage de l'application.
 */

import { EnergyEvolutionModel, DEFAULT_GAS_MODEL, DEFAULT_ELECTRICITY_MODEL } from './energyPriceEvolution'
import {
  getGasMeanReversionModel,
  getElectricityMeanReversionModel,
  getEnergyMeanReversionModel
} from './energyPriceEvolutionModels'

interface CachedModel {
  model: EnergyEvolutionModel
  timestamp: number
}

const modelCache: Record<string, CachedModel> = {}
let isPreloading = false
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 heures en millisecondes

/**
 * Récupère le modèle gaz avec cache (24h)
 */
export async function getCachedGasModel(): Promise<EnergyEvolutionModel> {
  const key = 'gaz'

  if (modelCache[key] && Date.now() - modelCache[key].timestamp < CACHE_DURATION) {
    console.log('✅ Utilisation modèle GAZ depuis cache')
    return modelCache[key].model
  }

  console.log('🌐 Récupération modèle GAZ depuis API DIDO...')
  const model = await getGasMeanReversionModel()

  modelCache[key] = {
    model,
    timestamp: Date.now()
  }

  return model
}

/**
 * Récupère le modèle électricité avec cache (24h)
 */
export async function getCachedElectricityModel(): Promise<EnergyEvolutionModel> {
  const key = 'electricite'

  if (modelCache[key] && Date.now() - modelCache[key].timestamp < CACHE_DURATION) {
    console.log('✅ Utilisation modèle ÉLECTRICITÉ depuis cache')
    return modelCache[key].model
  }

  console.log('🌐 Récupération modèle ÉLECTRICITÉ depuis API DIDO...')
  const model = await getElectricityMeanReversionModel()

  modelCache[key] = {
    model,
    timestamp: Date.now()
  }

  return model
}

/**
 * Récupère un modèle générique avec cache (24h)
 */
export async function getCachedEnergyModel(
  energyType: 'gaz' | 'electricite' | 'fioul' | 'bois'
): Promise<EnergyEvolutionModel> {
  const key = energyType

  if (modelCache[key] && Date.now() - modelCache[key].timestamp < CACHE_DURATION) {
    console.log(`✅ Utilisation modèle ${energyType.toUpperCase()} depuis cache`)
    return modelCache[key].model
  }

  console.log(`🌐 Récupération modèle ${energyType.toUpperCase()} depuis API DIDO...`)
  const model = await getEnergyMeanReversionModel(energyType)

  modelCache[key] = {
    model,
    timestamp: Date.now()
  }

  return model
}

/**
 * Force le rafraîchissement du cache (utile pour les tests)
 */
export function clearModelCache() {
  Object.keys(modelCache).forEach(key => delete modelCache[key])
  console.log('🗑️  Cache des modèles vidé')
}

/**
 * Récupère tous les modèles en une seule fois (optimisation)
 * Utilise le cache si disponible, sinon appelle l'API en parallèle
 */
export async function preloadAllModels(): Promise<void> {
  if (isPreloading) {
    console.log('⏳ Pré-chargement déjà en cours...')
    return
  }

  isPreloading = true
  console.log('📦 Pré-chargement de tous les modèles depuis API DIDO...')

  try {
    await Promise.all([
      getCachedGasModel(),
      getCachedElectricityModel(),
      getCachedEnergyModel('fioul'),
      getCachedEnergyModel('bois')
    ])

    console.log('✅ Tous les modèles sont en cache')
  } catch (error) {
    console.error('❌ Erreur lors du pré-chargement des modèles:', error)
  } finally {
    isPreloading = false
  }
}

// ============================================================================
// FONCTIONS SYNCHRONES avec fallback (pour éviter de casser l'app)
// ============================================================================

/**
 * Récupère le modèle gaz de manière SYNCHRONE
 * Utilise le cache si disponible, sinon retourne les valeurs par défaut
 * et lance le chargement en arrière-plan
 */
export function getGasModelSync(): EnergyEvolutionModel {
  const key = 'gaz'

  if (modelCache[key] && Date.now() - modelCache[key].timestamp < CACHE_DURATION) {
    return modelCache[key].model
  }

  // Pas en cache: lancer le chargement en arrière-plan
  getCachedGasModel().catch(err => console.error('Erreur chargement modèle gaz:', err))

  // Retourner valeurs par défaut en attendant
  return DEFAULT_GAS_MODEL
}

/**
 * Récupère le modèle électricité de manière SYNCHRONE
 */
export function getElectricityModelSync(): EnergyEvolutionModel {
  const key = 'electricite'

  if (modelCache[key] && Date.now() - modelCache[key].timestamp < CACHE_DURATION) {
    return modelCache[key].model
  }

  // Pas en cache: lancer le chargement en arrière-plan
  getCachedElectricityModel().catch(err => console.error('Erreur chargement modèle électricité:', err))

  // Retourner valeurs par défaut en attendant
  return DEFAULT_ELECTRICITY_MODEL
}

/**
 * Récupère un modèle énergétique de manière SYNCHRONE
 */
export function getEnergyModelSync(
  energyType: 'gaz' | 'electricite' | 'fioul' | 'bois'
): EnergyEvolutionModel {
  const key = energyType

  if (modelCache[key] && Date.now() - modelCache[key].timestamp < CACHE_DURATION) {
    return modelCache[key].model
  }

  // Pas en cache: lancer le chargement en arrière-plan
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
