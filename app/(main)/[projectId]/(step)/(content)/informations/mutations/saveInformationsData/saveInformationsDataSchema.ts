import { z } from "zod"

/**
 * Schéma de validation pour les données du formulaire informations (step 1)
 */
export const saveInformationsDataSchema = z.object({
  project_name: z
    .string({ message: "Le nom du projet est requis" })
    .min(1, "Le nom du projet est requis")
    .max(100, "Le nom du projet ne peut pas dépasser 100 caractères"),
  recipient_emails: z
    .array(
      z
        .string()
        .email("Email invalide")
    )
    .optional(),
})

export type SaveInformationsDataInput = z.infer<typeof saveInformationsDataSchema>

// Alias pour compatibilité avec le code existant
export const informationsSchema = saveInformationsDataSchema
export type InformationsData = SaveInformationsDataInput
