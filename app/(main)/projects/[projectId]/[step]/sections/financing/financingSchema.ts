import { z } from "zod"

export const financingSchema = z.object({
  mode_financement: z.enum(["Comptant", "Crédit", "Mixte"]),
  apport_personnel: z.number().min(0),
  montant_credit: z.number().min(0),
  taux_interet: z.number().min(0).max(100),
  duree_credit_mois: z.number().min(1).max(360),
  // mensualite will be calculated automatically in the action
})

export type FinancingData = z.infer<typeof financingSchema>
