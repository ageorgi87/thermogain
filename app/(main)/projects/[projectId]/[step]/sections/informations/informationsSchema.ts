import { z } from "zod"

export const informationsSchema = z.object({
  project_name: z
    .string()
    .min(1, "Le nom du projet est requis")
    .max(100, "Le nom du projet ne peut pas dépasser 100 caractères")
    .default("Projet PAC"),
  recipient_emails: z
    .array(
      z
        .string()
        .email("Email invalide")
    )
    .min(1, "Au moins un email est requis")
    .default([]),
})

export type InformationsData = z.infer<typeof informationsSchema>
