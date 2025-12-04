import { z } from "zod"

/**
 * Schéma de validation pour les types d'énergie supportés
 */
export const energyTypeSchema = z.enum(["gaz", "electricite", "fioul", "bois"])

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
  energyType: energyTypeSchema,
  model: energyEvolutionModelSchema
})

export type EnergyType = z.infer<typeof energyTypeSchema>
export type EnergyEvolutionModelInput = z.infer<typeof energyEvolutionModelSchema>
export type UpdateEnergyPriceCacheInput = z.infer<typeof updateEnergyPriceCacheSchema>
