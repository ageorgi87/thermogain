import { z } from "zod"

export const financingSchema = z.object({
  mode_financement: z.enum(["Comptant", "Crédit", "Mixte"]),
  apport_personnel: z.number().min(0).optional(),
  montant_credit: z.number().min(0).optional(),
  taux_interet: z.number().min(0).max(100).optional(),
  duree_credit_mois: z.number().min(1).max(360).optional(),
  // mensualite will be calculated automatically in the action
})

export type FinancingData = z.infer<typeof financingSchema>
