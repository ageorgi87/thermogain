import { z } from "zod"
import { TypeEcs } from "@/types/typeEcs"

export const currentDhwSchema = z
  .object({
    dhwSystemType: z.nativeEnum(TypeEcs, {
      message: "Le type d'ECS est requis",
    }),
    dhwConsumptionKnown: z.boolean({
      message: "Veuillez indiquer si vous connaissez votre consommation",
    }),
    dhwConsumptionKwh: z.number().min(0).max(50000).nullable().optional(),
    dhwEnergyPricePerKwh: z
      .number({ message: "Le prix de l'énergie est requis" })
      .min(0, "Le prix ne peut pas être négatif")
      .max(2, "Le prix ne peut pas dépasser 2 €/kWh"),
    dhwAnnualMaintenance: z
      .number({ message: "Le coût d'entretien est requis" })
      .min(0, "Le coût ne peut pas être négatif")
      .max(500, "Le coût ne peut pas dépasser 500 €/an"),
  })
  .superRefine((data, ctx) => {
    // Si l'utilisateur connaît sa consommation, elle est obligatoire
    if (data.dhwConsumptionKnown) {
      if (data.dhwConsumptionKwh === undefined || data.dhwConsumptionKwh === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La consommation d'ECS est requise",
          path: ["dhwConsumptionKwh"],
        })
      }
    }
  })

export type CurrentDhwData = z.infer<typeof currentDhwSchema>
