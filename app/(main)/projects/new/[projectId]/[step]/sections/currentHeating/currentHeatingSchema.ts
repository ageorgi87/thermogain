import { z } from "zod"

const baseSchema = z.object({
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

// Conditional validation based on heating type
export const currentHeatingSchema = baseSchema.superRefine((data, ctx) => {
  switch (data.type_chauffage) {
    case "Fioul":
      if (!data.conso_fioul_litres || data.conso_fioul_litres <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La consommation de fioul est requise",
          path: ["conso_fioul_litres"],
        })
      }
      if (!data.prix_fioul_litre || data.prix_fioul_litre <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le prix du fioul est requis",
          path: ["prix_fioul_litre"],
        })
      }
      break
    case "Gaz":
      if (!data.conso_gaz_kwh || data.conso_gaz_kwh <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La consommation de gaz est requise",
          path: ["conso_gaz_kwh"],
        })
      }
      if (!data.prix_gaz_kwh || data.prix_gaz_kwh <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le prix du gaz est requis",
          path: ["prix_gaz_kwh"],
        })
      }
      break
    case "GPL":
      if (!data.conso_gpl_kg || data.conso_gpl_kg <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La consommation de GPL est requise",
          path: ["conso_gpl_kg"],
        })
      }
      if (!data.prix_gpl_kg || data.prix_gpl_kg <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le prix du GPL est requis",
          path: ["prix_gpl_kg"],
        })
      }
      break
    case "Pellets":
      if (!data.conso_pellets_kg || data.conso_pellets_kg <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La consommation de pellets est requise",
          path: ["conso_pellets_kg"],
        })
      }
      if (!data.prix_pellets_kg || data.prix_pellets_kg <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le prix des pellets est requis",
          path: ["prix_pellets_kg"],
        })
      }
      break
    case "Bois":
      if (!data.conso_bois_steres || data.conso_bois_steres <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La consommation de bois est requise",
          path: ["conso_bois_steres"],
        })
      }
      if (!data.prix_bois_stere || data.prix_bois_stere <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le prix du bois est requis",
          path: ["prix_bois_stere"],
        })
      }
      break
    case "Electrique":
      if (!data.conso_elec_kwh || data.conso_elec_kwh <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La consommation électrique est requise",
          path: ["conso_elec_kwh"],
        })
      }
      if (!data.prix_elec_kwh || data.prix_elec_kwh <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le prix de l'électricité est requis",
          path: ["prix_elec_kwh"],
        })
      }
      break
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      if (!data.cop_actuel || data.cop_actuel <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le COP de la PAC actuelle est requis",
          path: ["cop_actuel"],
        })
      }
      if (!data.conso_pac_kwh || data.conso_pac_kwh <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La consommation de la PAC est requise",
          path: ["conso_pac_kwh"],
        })
      }
      if (!data.prix_elec_kwh || data.prix_elec_kwh <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le prix de l'électricité est requis",
          path: ["prix_elec_kwh"],
        })
      }
      break
    case "Autre":
      // No specific validation for "Autre" type
      break
  }
})

export type CurrentHeatingData = z.infer<typeof baseSchema>
