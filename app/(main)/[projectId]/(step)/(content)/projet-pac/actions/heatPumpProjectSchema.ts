import { z } from "zod"
import { PacType } from "@/types/pacType"
import { EmitterType } from "@/types/emitterType"

export const heatPumpProjectSchema = z.object({
  heatPumpType: z.nativeEnum(PacType, {
    message: "Le type de PAC est requis",
  }),

  // Prix électricité et puissance souscrite actuelle
  electricityPricePerKwh: z
    .number({ message: "Le prix de l'électricité est requis" })
    .min(0, "Le prix ne peut pas être négatif")
    .max(1, "Le prix semble trop élevé")
    .refine((val) => {
      const decimalPart = val.toString().split('.')[1]
      return !decimalPart || decimalPart.length <= 3
    }, "Le prix ne peut pas avoir plus de 3 décimales"),

  currentSubscribedPowerKva: z
    .number({ message: "La puissance souscrite actuelle est requise" })
    .min(3, "La puissance doit être au minimum de 3 kVA")
    .max(36, "La puissance ne peut pas dépasser 36 kVA"),

  heatPumpPowerKw: z
    .number({ message: "La puissance de la PAC est requise" })
    .min(1, "La puissance doit être d'au moins 1 kW"),

  estimatedCop: z
    .number({ message: "Le COP estimé est requis" })
    .min(1, "Le COP doit être d'au moins 1")
    .max(10, "Le COP ne peut pas dépasser 10"),

  heatPumpLifespanYears: z
    .number({ message: "La durée de vie de la PAC est requise" })
    .min(5, "La durée de vie doit être d'au moins 5 ans")
    .max(30, "La durée de vie ne peut pas dépasser 30 ans"),

  heatPumpSubscribedPowerKva: z
    .number({ message: "La puissance souscrite pour la PAC est requise" })
    .min(3, "La puissance doit être au minimum de 3 kVA")
    .max(36, "La puissance ne peut pas dépasser 36 kVA"),

  annualMaintenanceCost: z
    .number({ message: "Le coût d'entretien annuel est requis" })
    .min(0, "Le coût ne peut pas être négatif")
    .max(500, "Le coût ne peut pas dépasser 500 €/an"),

  heatPumpElectricityPricePerKwh: z
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
  emitters: z.nativeEnum(EmitterType).optional(),
}).superRefine((data, ctx) => {
  // Pour les PAC hydrauliques (Air/Eau et Eau/Eau), émetteurs est REQUIS
  const isWaterBased = data.heatPumpType === PacType.AIR_EAU || data.heatPumpType === PacType.EAU_EAU

  if (isWaterBased && data.emitters === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le type d'émetteurs est requis pour les PAC hydrauliques",
      path: ["emitters"],
    })
  }
})

export type HeatPumpProjectData = z.infer<typeof heatPumpProjectSchema>
