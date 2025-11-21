import { z } from "zod"

export const evolutionsSchema = z.object({
  evolution_prix_energie: z.number().min(-50).max(50),
  evolution_prix_electricite: z.number().min(-50).max(50),
  duree_etude_annees: z.number().min(1).max(30),
})

export type EvolutionsData = z.infer<typeof evolutionsSchema>
