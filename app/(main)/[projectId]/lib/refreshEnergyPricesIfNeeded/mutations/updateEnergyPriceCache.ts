"use server"

import { prisma } from "@/lib/prisma"
import type { EnergyEvolutionModel } from "@/types/energy"
import type { ApiEnergyType } from "@/types/energyType"
import { updateEnergyPriceCacheSchema } from "./updateEnergyPriceCacheSchema"

/**
 * Met à jour le cache des prix énergétiques en DB
 *
 * @param energyType Type d'énergie
 * @param model Modèle énergétique à sauvegarder
 * @throws Error si les données sont invalides
 */
export const updateEnergyPriceCache = async (
  energyType: ApiEnergyType,
  model: EnergyEvolutionModel
): Promise<void> => {
  // Validation avec Zod
  const validatedData = updateEnergyPriceCacheSchema.parse({
    energyType,
    model
  })

  await prisma.energyPriceCache.upsert({
    where: { energyType: validatedData.energyType },
    update: {
      recentRate: validatedData.model.recentRate,
      equilibriumRate: validatedData.model.equilibriumRate,
      transitionYears: validatedData.model.transitionYears,
      currentPrice: validatedData.model.currentPrice,
      lastUpdated: new Date()
    },
    create: {
      energyType: validatedData.energyType,
      recentRate: validatedData.model.recentRate,
      equilibriumRate: validatedData.model.equilibriumRate,
      transitionYears: validatedData.model.transitionYears,
      currentPrice: validatedData.model.currentPrice,
      lastUpdated: new Date()
    }
  })
}
