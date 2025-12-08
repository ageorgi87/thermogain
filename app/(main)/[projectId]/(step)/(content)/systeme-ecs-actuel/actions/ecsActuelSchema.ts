import { z } from "zod"
import { TypeEcs } from "@/types/typeEcs"

export const ecsActuelSchema = z
  .object({
    type_ecs: z.nativeEnum(TypeEcs, {
      message: "Le type d'ECS est requis",
    }),
    consumption_known: z.boolean({
      message: "Veuillez indiquer si vous connaissez votre consommation",
    }),
    conso_ecs_kwh: z.number().min(0).max(50000).nullable().optional(),
    prix_ecs_kwh: z
      .number({ message: "Le prix de l'énergie est requis" })
      .min(0, "Le prix ne peut pas être négatif")
      .max(2, "Le prix ne peut pas dépasser 2 €/kWh"),
    entretien_ecs: z
      .number({ message: "Le coût d'entretien est requis" })
      .min(0, "Le coût ne peut pas être négatif")
      .max(500, "Le coût ne peut pas dépasser 500 €/an"),
  })
  .superRefine((data, ctx) => {
    // Si l'utilisateur connaît sa consommation, elle est obligatoire
    if (data.consumption_known) {
      if (data.conso_ecs_kwh === undefined || data.conso_ecs_kwh === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La consommation d'ECS est requise",
          path: ["conso_ecs_kwh"],
        })
      }
    }
  })

export type EcsActuelData = z.infer<typeof ecsActuelSchema>
