import { prisma } from "@/lib/prisma"
import type { EnergyEvolutionModel } from "@/lib/energyPriceEvolution"

const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 jours en millisecondes

/**
 * Récupère un modèle depuis la base de données
 */
export const getModelFromDb = async (
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
