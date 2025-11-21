import { z } from "zod"

export const heatPumpProjectSchema = z.object({
  type_pac: z.enum(["Air/Eau", "Eau/Eau", "Air/Air"]),
  puissance_pac_kw: z.number().min(1),
  cop_estime: z.number().min(1).max(10),
  temperature_depart: z.number().min(30).max(80),
  emetteurs: z.enum([
    "Radiateurs haute température",
    "Radiateurs basse température",
    "Plancher chauffant",
    "Ventilo-convecteurs",
  ]),
  ballon_ecs: z.boolean(),
  volume_ballon: z.number().optional(),
})

export type HeatPumpProjectData = z.infer<typeof heatPumpProjectSchema>
