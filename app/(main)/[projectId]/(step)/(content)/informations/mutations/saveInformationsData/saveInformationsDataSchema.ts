import { z } from "zod"
import { PacType } from "@/types/pacType"

/**
 * Schéma de validation pour les données du formulaire informations (step 1)
 */
export const saveInformationsDataSchema = z
  .object({
    project_name: z
      .string({ message: "Le nom du projet est requis" })
      .min(1, "Le nom du projet est requis")
      .max(100, "Le nom du projet ne peut pas dépasser 100 caractères"),
    recipient_emails: z
      .array(z.string().email("Email invalide"))
      .optional(),

    // PAC type selection (required)
    type_pac: z.nativeEnum(PacType, {
      message: "Le type de PAC est requis",
    }),

    // DHW management (only for water-based PACs: Air/Eau, Eau/Eau)
    // true = avec ECS, false = sans ECS
    with_ecs_management: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If Air/Eau or Eau/Eau, with_ecs_management is required
      if (
        data.type_pac === PacType.AIR_EAU ||
        data.type_pac === PacType.EAU_EAU
      ) {
        return data.with_ecs_management !== undefined
      }
      return true
    },
    {
      message: "La gestion de l'ECS est requise pour ce type de PAC",
      path: ["with_ecs_management"],
    }
  )

export type SaveInformationsDataInput = z.infer<
  typeof saveInformationsDataSchema
>

// Alias pour compatibilité avec le code existant
export const informationsSchema = saveInformationsDataSchema
export type InformationsData = SaveInformationsDataInput
