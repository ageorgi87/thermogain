import { z } from "zod"

export const evolutionsSchema = z.object({
  // Evolution prix énergie actuelle (selon type_chauffage)
  evolution_prix_fioul: z.number().min(-50, "L'évolution doit être entre -50% et +50%").max(50, "L'évolution doit être entre -50% et +50%").optional(),
  evolution_prix_gaz: z.number().min(-50, "L'évolution doit être entre -50% et +50%").max(50, "L'évolution doit être entre -50% et +50%").optional(),
  evolution_prix_gpl: z.number().min(-50, "L'évolution doit être entre -50% et +50%").max(50, "L'évolution doit être entre -50% et +50%").optional(),
  evolution_prix_bois: z.number().min(-50, "L'évolution doit être entre -50% et +50%").max(50, "L'évolution doit être entre -50% et +50%").optional(),

  // Evolution prix électricité pour PAC (et aussi pour chauffage électrique actuel)
  evolution_prix_electricite: z.number().min(-50, "L'évolution doit être entre -50% et +50%").max(50, "L'évolution doit être entre -50% et +50%"),

  duree_etude_annees: z.number().min(1, "La durée doit être d'au moins 1 an").max(30, "La durée ne peut pas dépasser 30 ans"),
})

export type EvolutionsData = z.infer<typeof evolutionsSchema>
