/**
 * Cache des modèles Mean Reversion pour éviter de rappeler l'API DIDO à chaque calcul
 *
 * Les modèles sont mis en cache dans la base de données pendant 30 jours car ils ne changent que mensuellement
 * (nouvelles données DIDO publiées une fois par mois)
 *
 * IMPORTANT: Ce système utilise Prisma pour persister le cache entre les redémarrages du serveur
 */

import { prisma } from './prisma'
import { EnergyEvolutionModel, DEFAULT_GAS_MODEL, DEFAULT_ELECTRICITY_MODEL } from './energyPriceEvolution'
import {
  getGasMeanReversionModel,
  getElectricityMeanReversionModel,
  getEnergyMeanReversionModel
} from './energyPriceEvolutionModels'

// Cache en mémoire pour optimiser les lectures pendant l'exécution
const memoryCache: Record<string, { model: EnergyEvolutionModel; timestamp: number }> = {}
let isPreloading = false
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 jours en millisecondes

/**
 * Convertit un modèle EnergyEvolutionModel en objet JSON pour la DB
 */
const modelToJson = (model: EnergyEvolutionModel): string => {
  return JSON.stringify(model)
}

/**
 * Convertit un objet JSON de la DB en EnergyEvolutionModel
 */
const jsonToModel = (json: string): EnergyEvolutionModel => {
  return JSON.parse(json)
}

/**
 * Récupère un modèle depuis la base de données
 */
const getModelFromDb = async (
  energyType: 'gaz' | 'electricite' | 'fioul' | 'bois'
): Promise<EnergyEvolutionModel | null> => {
  try {
    const cached = await prisma.energyPriceCache.findUnique({
      where: { energyType }
    })

    if (!cached) {
      return null
    }

    // Vérifier si le cache est encore valide (moins de 30 jours)
    const age = Date.now() - cached.lastUpdated.getTime()
    if (age > CACHE_DURATION) {
      console.log(`⏰ Cache DB pour ${energyType.toUpperCase()} expiré (${Math.round(age / (24 * 60 * 60 * 1000))} jours)`)
      return null
    }

    // Construire le modèle depuis les données DB
    const model: EnergyEvolutionModel = {
      type: 'mean-reversion',
      tauxRecent: cached.evolution_10y,
      tauxEquilibre: 2.5, // Valeur standard pour tous les types
      anneesTransition: 5  // Valeur standard pour tous les types
    }

    console.log(`✅ Modèle ${energyType.toUpperCase()} récupéré depuis DB (cache de ${Math.round(age / (24 * 60 * 60 * 1000))} jours)`)
    return model
  } catch (error) {
    console.error(`Erreur lecture cache DB pour ${energyType}:`, error)
    return null
  }
}

/**
 * Sauvegarde un modèle dans la base de données
 */
const saveModelToDb = async (
  energyType: 'gaz' | 'electricite' | 'fioul' | 'bois',
  model: EnergyEvolutionModel
): Promise<void> => {
  try {
    await prisma.energyPriceCache.upsert({
      where: { energyType },
      update: {
        evolution_10y: model.tauxRecent,
        lastUpdated: new Date()
      },
      create: {
        energyType,
        currentPrice: 0, // Non utilisé dans ce contexte
        evolution_10y: model.tauxRecent,
        lastUpdated: new Date()
      }
    })
    console.log(`💾 Modèle ${energyType.toUpperCase()} sauvegardé en DB`)
  } catch (error) {
    console.error(`Erreur sauvegarde cache DB pour ${energyType}:`, error)
  }
}

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
  const model = await getGasMeanReversionModel()

  // Sauvegarder en DB et en mémoire
  await saveModelToDb('gaz', model)
  memoryCache[key] = {
    model,
    timestamp: Date.now()
  }

  return model
}

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

/**
 * Force le rafraîchissement du cache (utile pour les tests)
 */
export const clearModelCache = async () => {
  // Vider le cache mémoire
  Object.keys(memoryCache).forEach(key => delete memoryCache[key])

  // Vider le cache DB
  try {
    await prisma.energyPriceCache.deleteMany({})
    console.log('🗑️  Cache mémoire et DB vidés')
  } catch (error) {
    console.error('Erreur vidage cache DB:', error)
  }
}

/**
 * Récupère tous les modèles en une seule fois (optimisation)
 * Utilise le cache si disponible, sinon appelle l'API en parallèle
 */
export const preloadAllModels = async (): Promise<void> => {
  if (isPreloading) {
    console.log('⏳ Pré-chargement déjà en cours...')
    return
  }

  isPreloading = true
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
    isPreloading = false
  }
}

// ============================================================================
// FONCTIONS SYNCHRONES avec fallback (pour éviter de casser l'app)
// ============================================================================

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
