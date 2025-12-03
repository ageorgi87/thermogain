import { prisma } from "@/lib/prisma"
import type { EnergyEvolutionModel } from "@/lib/energyPriceEvolution"

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
