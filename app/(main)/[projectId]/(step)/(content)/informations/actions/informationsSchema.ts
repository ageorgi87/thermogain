import { z } from "zod"

export const informationsSchema = z.object({
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

export type InformationsData = z.infer<typeof informationsSchema>
