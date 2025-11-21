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
  age_installation: z
    .number()
    .min(0, "L'âge ne peut pas être négatif")
    .max(100, "L'âge ne peut pas dépasser 100 ans"),
  etat_installation: z.enum(["Bon", "Moyen", "Mauvais"]),
  // Consumption fields - conditional based on type_chauffage
  conso_fioul_litres: z.number().min(0, "La consommation ne peut pas être négative").max(50000, "La consommation semble trop élevée").optional(),
  prix_fioul_litre: z.number().min(0, "Le prix ne peut pas être négatif").max(10, "Le prix semble trop élevé").optional(),
  conso_gaz_kwh: z.number().min(0, "La consommation ne peut pas être négative").max(100000, "La consommation semble trop élevée").optional(),
  prix_gaz_kwh: z.number().min(0, "Le prix ne peut pas être négatif").max(1, "Le prix semble trop élevé").optional(),
  conso_gpl_kg: z.number().min(0, "La consommation ne peut pas être négative").max(10000, "La consommation semble trop élevée").optional(),
  prix_gpl_kg: z.number().min(0, "Le prix ne peut pas être négatif").max(10, "Le prix semble trop élevé").optional(),
  conso_pellets_kg: z.number().min(0, "La consommation ne peut pas être négative").max(20000, "La consommation semble trop élevée").optional(),
  prix_pellets_kg: z.number().min(0, "Le prix ne peut pas être négatif").max(2, "Le prix semble trop élevé").optional(),
  conso_bois_steres: z.number().min(0, "La consommation ne peut pas être négative").max(100, "La consommation semble trop élevée").optional(),
  prix_bois_stere: z.number().min(0, "Le prix ne peut pas être négatif").max(500, "Le prix semble trop élevé").optional(),
  conso_elec_kwh: z.number().min(0, "La consommation ne peut pas être négative").max(100000, "La consommation semble trop élevée").optional(),
  prix_elec_kwh: z.number().min(0, "Le prix ne peut pas être négatif").max(1, "Le prix semble trop élevé").optional(),
  cop_actuel: z.number().min(1, "Le COP doit être au moins de 1").max(10, "Le COP ne peut pas dépasser 10").optional(),
  conso_pac_kwh: z.number().min(0, "La consommation ne peut pas être négative").max(100000, "La consommation semble trop élevée").optional(),
})

export type CurrentHeatingData = z.infer<typeof currentHeatingSchema>
