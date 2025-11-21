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
  // Consumption fields - conditional based on type_chauffage
  conso_fioul_litres: z.number().optional(),
  prix_fioul_litre: z.number().optional(),
  conso_gaz_kwh: z.number().optional(),
  prix_gaz_kwh: z.number().optional(),
  conso_gpl_kg: z.number().optional(),
  prix_gpl_kg: z.number().optional(),
  conso_pellets_kg: z.number().optional(),
  prix_pellets_kg: z.number().optional(),
  conso_bois_steres: z.number().optional(),
  prix_bois_stere: z.number().optional(),
  conso_elec_kwh: z.number().optional(),
  prix_elec_kwh: z.number().optional(),
  cop_actuel: z.number().optional(),
  conso_pac_kwh: z.number().optional(),
})

export type CurrentHeatingData = z.infer<typeof currentHeatingSchema>
