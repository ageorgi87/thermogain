import { z } from "zod"

// Champs communs à tous les types de PAC
const baseFields = {
  type_pac: z.enum(["Air/Eau", "Eau/Eau", "Air/Air"], {
    message: "Le type de PAC est requis",
  }),

  // Prix électricité et puissance souscrite actuelle
  prix_elec_kwh: z
    .number({ message: "Le prix de l'électricité est requis" })
    .min(0, "Le prix ne peut pas être négatif")
    .max(1, "Le prix semble trop élevé")
    .refine((val) => {
      const decimalPart = val.toString().split('.')[1]
      return !decimalPart || decimalPart.length <= 3
    }, "Le prix ne peut pas avoir plus de 3 décimales"),

  puissance_souscrite_actuelle: z
    .number({ message: "La puissance souscrite actuelle est requise" })
    .min(3, "La puissance doit être au minimum de 3 kVA")
    .max(36, "La puissance ne peut pas dépasser 36 kVA"),

  puissance_pac_kw: z
    .number({ message: "La puissance de la PAC est requise" })
    .min(1, "La puissance doit être d'au moins 1 kW"),

  cop_estime: z
    .number({ message: "Le COP estimé est requis" })
    .min(1, "Le COP doit être d'au moins 1")
    .max(10, "Le COP ne peut pas dépasser 10"),

  duree_vie_pac: z
    .number({ message: "La durée de vie de la PAC est requise" })
    .min(5, "La durée de vie doit être d'au moins 5 ans")
    .max(30, "La durée de vie ne peut pas dépasser 30 ans"),

  puissance_souscrite_pac: z
    .number({ message: "La puissance souscrite pour la PAC est requise" })
    .min(3, "La puissance doit être au minimum de 3 kVA")
    .max(36, "La puissance ne peut pas dépasser 36 kVA"),

  entretien_pac_annuel: z
    .number({ message: "Le coût d'entretien annuel est requis" })
    .min(0, "Le coût ne peut pas être négatif")
    .max(500, "Le coût ne peut pas dépasser 500 €/an"),

  prix_elec_pac: z
    .number({ message: "Le prix de l'électricité pour la PAC est requis" })
    .min(0, "Le prix ne peut pas être négatif")
    .max(1, "Le prix semble trop élevé")
    .refine((val) => {
      const decimalPart = val.toString().split('.')[1]
      return !decimalPart || decimalPart.length <= 3
    }, "Le prix ne peut pas avoir plus de 3 décimales")
    .optional(),
}

// Schéma pour PAC hydrauliques (Air/Eau et Eau/Eau) - température et émetteurs REQUIS
const waterBasedPacSchema = z.object({
  ...baseFields,
  temperature_depart: z
    .number({ message: "La température de départ est requise" })
    .min(30, "La température doit être d'au moins 30°C")
    .max(80, "La température ne peut pas dépasser 80°C"),
  emetteurs: z.enum([
    "Radiateurs haute température",
    "Radiateurs basse température",
    "Plancher chauffant",
    "Ventilo-convecteurs",
  ], {
    message: "Le type d'émetteurs est requis",
  }),
})

// Schéma pour PAC Air/Air - température et émetteurs optionnels (auto-remplis)
const airToAirPacSchema = z.object({
  ...baseFields,
  temperature_depart: z.number().optional(),
  emetteurs: z.enum([
    "Radiateurs haute température",
    "Radiateurs basse température",
    "Plancher chauffant",
    "Ventilo-convecteurs",
  ]).optional(),
})

// Union discriminée basée sur type_pac
export const heatPumpProjectSchema = z.discriminatedUnion("type_pac", [
  waterBasedPacSchema.extend({ type_pac: z.literal("Air/Eau") }),
  waterBasedPacSchema.extend({ type_pac: z.literal("Eau/Eau") }),
  airToAirPacSchema.extend({ type_pac: z.literal("Air/Air") }),
])

export type HeatPumpProjectData = z.infer<typeof heatPumpProjectSchema>
