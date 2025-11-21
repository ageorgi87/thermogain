import { z } from "zod"

export const currentHeatingSchema = z.object({
  type_chauffage: z.enum([
    "Fioul",
    "Gaz",
    "GPL",
    "Pellets",
    "Bois",
    "Electrique",
    "PAC Air/Air",
    "PAC Air/Eau",
    "PAC Eau/Eau",
    "Autre",
  ]),
  age_installation: z.number().min(0),
  etat_installation: z.enum(["Bon", "Moyen", "Mauvais"]),
})

export type CurrentHeatingData = z.infer<typeof currentHeatingSchema>
