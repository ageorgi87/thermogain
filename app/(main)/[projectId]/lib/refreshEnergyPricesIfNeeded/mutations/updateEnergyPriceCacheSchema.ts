import { z } from "zod"
import { EnergyType } from "@/types/energyType"

/**
 * Schéma de validation pour les types d'énergie supportés par l'API DIDO
 * (gaz, electricite, fioul, bois - sans GPL qui est calculé depuis fioul)
 */
export const apiEnergyTypeSchema = z.enum([
  EnergyType.GAZ,
  EnergyType.ELECTRICITE,
  EnergyType.FIOUL,
  EnergyType.BOIS
])

/**
 * Schéma de validation pour le modèle d'évolution énergétique
 */
export const energyEvolutionModelSchema = z.object({
  tauxRecent: z.number().finite(),

  tauxEquilibre: z.number().finite(),

  anneesTransition: z.number()
    .int()
    .positive()
    .optional()
    .default(5),

  currentPrice: z.number()
    .nonnegative()
    .finite()
    .optional()
    .default(0)
})

/**
 * Schéma de validation pour les paramètres de mise à jour du cache
 */
export const updateEnergyPriceCacheSchema = z.object({
  energyType: apiEnergyTypeSchema,
  model: energyEvolutionModelSchema
})

export type EnergyEvolutionModelInput = z.infer<typeof energyEvolutionModelSchema>
export type UpdateEnergyPriceCacheInput = z.infer<typeof updateEnergyPriceCacheSchema>
