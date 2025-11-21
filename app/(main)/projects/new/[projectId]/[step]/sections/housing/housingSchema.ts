import { z } from "zod"

export const housingSchema = z.object({
  departement: z.string().min(1, "Le département est requis"),
  annee_construction: z.number().min(1800).max(2100),
  surface_habitable: z.number().min(1),
  nombre_occupants: z.number().min(1),
  isolation_murs: z.boolean(),
  isolation_combles: z.boolean(),
  double_vitrage: z.boolean(),
})

export type HousingData = z.infer<typeof housingSchema>
