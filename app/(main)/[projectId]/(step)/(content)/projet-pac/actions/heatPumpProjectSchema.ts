import { z } from "zod"
import { PacType } from "@/types/pacType"

export const heatPumpProjectSchema = z.object({
  type_pac: z.nativeEnum(PacType, {
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

  // Émetteurs - optionnel de base mais requis pour PAC hydrauliques
  // La température de départ est automatiquement déduite du type d'émetteur
  emetteurs: z.enum([
    "Radiateurs haute température",
    "Radiateurs basse température",
    "Radiateurs moyenne température",
    "Plancher chauffant",
    "Ventilo-convecteurs",
  ]).optional(),
}).superRefine((data, ctx) => {
  // Pour les PAC hydrauliques (Air/Eau et Eau/Eau), émetteurs est REQUIS
  const isWaterBased = data.type_pac === PacType.AIR_EAU || data.type_pac === PacType.EAU_EAU

  if (isWaterBased && data.emetteurs === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le type d'émetteurs est requis pour les PAC hydrauliques",
      path: ["emetteurs"],
    })
  }
})

export type HeatPumpProjectData = z.infer<typeof heatPumpProjectSchema>
