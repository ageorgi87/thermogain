import { z } from "zod"

// Validation du code postal français (métropole, Corse, DOM-TOM)
const codePostalRegex = /^(?:0[1-9]|[1-8]\d|9[0-5]|2[AB]|97[1-8])\d{3}$/

export const housingSchema = z.object({
  code_postal: z
    .string()
    .min(1, "Le code postal est requis")
    .regex(codePostalRegex, "Code postal invalide (ex: 75001, 20000, 97400)"),
  annee_construction: z
    .number()
    .min(1800, "L'année doit être supérieure à 1800")
    .max(new Date().getFullYear() + 2, "L'année ne peut pas être dans le futur"),
  surface_habitable: z
    .number()
    .min(10, "La surface doit être d'au moins 10 m²")
    .max(1000, "La surface ne peut pas dépasser 1000 m²"),
  nombre_occupants: z
    .number()
    .min(1, "Il doit y avoir au moins 1 occupant")
    .max(20, "Le nombre d'occupants ne peut pas dépasser 20"),
  isolation_murs: z.boolean(),
  isolation_combles: z.boolean(),
  double_vitrage: z.boolean(),
})

export type HousingData = z.infer<typeof housingSchema>
