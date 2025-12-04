"use server"

import { prisma } from "@/lib/prisma"
import type { EnergyEvolutionModel } from "@/types/energy"

/**
 * Met à jour le cache des prix énergétiques en DB
 *
 * @param energyType Type d'énergie
 * @param model Modèle énergétique à sauvegarder
 */
export const updateEnergyPriceCache = async (
  energyType: "gaz" | "electricite" | "fioul" | "bois",
  model: EnergyEvolutionModel
): Promise<void> => {
  await prisma.energyPriceCache.upsert({
    where: { energyType },
    update: {
      tauxRecent: model.tauxRecent,
      tauxEquilibre: model.tauxEquilibre,
      anneesTransition: model.anneesTransition || 5,
      currentPrice: model.currentPrice || 0,
      lastUpdated: new Date()
    },
    create: {
      energyType,
      tauxRecent: model.tauxRecent,
      tauxEquilibre: model.tauxEquilibre,
      anneesTransition: model.anneesTransition || 5,
      currentPrice: model.currentPrice || 0,
      lastUpdated: new Date()
    }
  })
}
