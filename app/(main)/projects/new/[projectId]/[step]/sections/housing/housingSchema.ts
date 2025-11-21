import { z } from "zod"

// Validation du code postal français (métropole, Corse, DOM-TOM)
const codePostalRegex = /^(?:0[1-9]|[1-8]\d|9[0-5]|2[AB]|97[1-8])\d{3}$/

export const housingSchema = z.object({
  code_postal: z
    .string()
    .min(1, "Le code postal est requis")
    .regex(codePostalRegex, "Code postal invalide (ex: 75001, 20000, 97400)"),
  annee_construction: z.number().min(1800).max(2100),
  surface_habitable: z.number().min(1),
  nombre_occupants: z.number().min(1),
  isolation_murs: z.boolean(),
  isolation_combles: z.boolean(),
  double_vitrage: z.boolean(),
})

export type HousingData = z.infer<typeof housingSchema>
