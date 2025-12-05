"use server"

import { prisma } from "@/lib/prisma"
import type { EnergyEvolutionModel } from "@/types/energy"
import type { ApiEnergyType } from "@/types/energyType"

/**
 * Récupère les données d'évolution des prix énergétiques depuis la DB
 *
 * IMPORTANT: Cette fonction ne fait que lire la DB.
 * Les données sont rafraîchies au step 1 (informations) par refreshEnergyPricesIfNeeded().
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', 'bois')
 * @returns Données d'évolution des prix depuis la DB
 * @throws Error si les données ne sont pas en DB
 */
export const getEnergyPriceEvolutionFromDB = async (
  energyType: ApiEnergyType
): Promise<EnergyEvolutionModel> => {
  const energyData = await prisma.energyPriceCache.findUnique({
    where: { energyType }
  })

  if (!energyData) {
    throw new Error(
      `Modèle énergétique ${energyType} manquant en DB. ` +
      `Les données devraient être rafraîchies au step 1 (informations).`
    )
  }

  return {
    tauxRecent: energyData.tauxRecent,
    tauxEquilibre: energyData.tauxEquilibre,
    anneesTransition: energyData.anneesTransition,
    currentPrice: energyData.currentPrice
  }
}
