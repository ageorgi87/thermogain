"use server"

import { prisma } from "@/lib/prisma"
import type { EnergyEvolutionModel } from "@/types/energy"

/**
 * Récupère le modèle d'évolution énergétique depuis la DB
 *
 * IMPORTANT: Cette fonction ne fait que lire la DB.
 * Les données sont rafraîchies au step 1 (informations) par refreshEnergyPricesIfNeeded().
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', 'bois')
 * @returns Modèle d'évolution depuis la DB
 * @throws Error si les données ne sont pas en DB
 */
export const getEnergyModelFromDB = async (
  energyType: "gaz" | "electricite" | "fioul" | "bois"
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
