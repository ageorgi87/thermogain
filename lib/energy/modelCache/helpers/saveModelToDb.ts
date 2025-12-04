import { prisma } from "@/lib/prisma"
import type { EnergyEvolutionModel } from "@/types/energy"

/**
 * Sauvegarde un modèle dans la base de données
 */
export const saveModelToDb = async (
  energyType: 'gaz' | 'electricite' | 'fioul' | 'bois',
  model: EnergyEvolutionModel
): Promise<void> => {
  try {
    await prisma.energyPriceCache.upsert({
      where: { energyType },
      update: {
        tauxRecent: model.tauxRecent,
        tauxEquilibre: model.tauxEquilibre,
        anneesTransition: model.anneesTransition || 5,
        lastUpdated: new Date()
      },
      create: {
        energyType,
        currentPrice: 0, // Legacy field
        tauxRecent: model.tauxRecent,
        tauxEquilibre: model.tauxEquilibre,
        anneesTransition: model.anneesTransition || 5,
        lastUpdated: new Date()
      }
    })
    console.log(`💾 Modèle ${energyType.toUpperCase()} sauvegardé en DB`)
  } catch (error) {
    console.error(`Erreur sauvegarde cache DB pour ${energyType}:`, error)
  }
}
