import { z } from "zod"

const baseSchema = z.object({
  mode_financement: z.enum(["Comptant", "Crédit", "Mixte"]),
  apport_personnel: z.number().min(0).default(0),
  montant_credit: z.number().min(0).default(0),
  taux_interet: z.number().min(0).max(100).default(0),
  duree_credit_mois: z.number().min(1).max(360).default(1),
  // mensualite will be calculated automatically in the action
})

export const financingSchema = baseSchema.superRefine((data, ctx) => {
  // Si mode = "Crédit" : taux_interet et duree_credit_mois sont obligatoires
  if (data.mode_financement === "Crédit") {
    if (data.taux_interet === undefined || data.taux_interet <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le taux d'intérêt est requis pour un financement par crédit",
        path: ["taux_interet"],
      })
    }
    if (data.duree_credit_mois === undefined || data.duree_credit_mois <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La durée du crédit est requise pour un financement par crédit",
        path: ["duree_credit_mois"],
      })
    }
  }

  // Si mode = "Mixte" : apport_personnel, taux_interet et duree_credit_mois sont obligatoires
  if (data.mode_financement === "Mixte") {
    if (data.apport_personnel === undefined || data.apport_personnel <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'apport personnel est requis pour un financement mixte",
        path: ["apport_personnel"],
      })
    }
    if (data.taux_interet === undefined || data.taux_interet <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le taux d'intérêt est requis pour un financement mixte",
        path: ["taux_interet"],
      })
    }
    if (data.duree_credit_mois === undefined || data.duree_credit_mois <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La durée du crédit est requise pour un financement mixte",
        path: ["duree_credit_mois"],
      })
    }
  }
})

export type FinancingData = z.infer<typeof financingSchema>
