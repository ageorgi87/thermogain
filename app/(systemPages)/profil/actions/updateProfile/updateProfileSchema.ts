import { z } from "zod"

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "Le prénom est requis")
    .max(100, "Le prénom est trop long")
    .optional()
    .or(z.literal("")),
  lastName: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom est trop long")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, "Numéro de téléphone invalide (ex: 0612345678)")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(200, "Le nom de l'entreprise est trop long")
    .optional()
    .or(z.literal("")),
  siret: z
    .string()
    .regex(/^\d{14}$/, "Le SIRET doit contenir exactement 14 chiffres")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(200, "L'adresse est trop longue")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(100, "Le nom de la ville est trop long")
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Le code postal doit contenir 5 chiffres")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("URL invalide (ex: https://www.exemple.fr)")
    .optional()
    .or(z.literal("")),
})

export type UpdateProfileData = z.infer<typeof updateProfileSchema>
