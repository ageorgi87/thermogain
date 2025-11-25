import { z } from "zod"

export const heatPumpProjectSchema = z.object({
  type_pac: z.enum(["Air/Eau", "Eau/Eau", "Air/Air"]),
  puissance_pac_kw: z.number().min(1).default(10),
  cop_estime: z.number().min(1).max(10).default(3),
  temperature_depart: z.number().min(30).max(80).optional(),
  emetteurs: z.enum([
    "Radiateurs haute température",
    "Radiateurs basse température",
    "Plancher chauffant",
    "Ventilo-convecteurs",
  ]).optional(),
  duree_vie_pac: z.number().min(5).max(30).default(17),
}).superRefine((data, ctx) => {
  // Temperature departure and emitters are required for water-based systems (Air/Eau, Eau/Eau)
  // Air/Air systems don't have water circuits, so these fields are not applicable
  const isWaterBased = data.type_pac === "Air/Eau" || data.type_pac === "Eau/Eau"

  if (isWaterBased) {
    if (!data.temperature_depart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La température de départ est requise pour les PAC hydrauliques (Air/Eau et Eau/Eau)",
        path: ["temperature_depart"],
      })
    }
    if (!data.emetteurs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le type d'émetteurs est requis pour les PAC hydrauliques",
        path: ["emetteurs"],
      })
    }
  }

  // For Air/Air systems, only "Ventilo-convecteurs" (splits) is valid if emetteurs is provided
  if (data.type_pac === "Air/Air" && data.emetteurs && data.emetteurs !== "Ventilo-convecteurs") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Les PAC Air/Air utilisent uniquement des unités intérieures (splits), pas de radiateurs ou plancher chauffant",
      path: ["emetteurs"],
    })
  }
})

export type HeatPumpProjectData = z.infer<typeof heatPumpProjectSchema>
