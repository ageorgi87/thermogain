import { z } from "zod"
import { TypeLogement } from "@/app/(main)/[projectId]/(step)/(content)/logement/types/logement"

export const financialAidSchema = z.object({
  // Critères d'éligibilité (optionnels car renseignés dans le calculateur)
  housingType: z.nativeEnum(TypeLogement).nullish(),
  referenceTaxIncome: z.number().min(0).nullish(),
  isPrimaryResidence: z.boolean().nullish(),
  isCompleteReplacement: z.boolean().nullish(),

  // Montants des aides
  maPrimeRenov: z
    .number()
    .min(0, "Le montant ne peut pas être négatif")
    .optional(),
  cee: z
    .number()
    .min(0, "Le montant ne peut pas être négatif")
    .optional(),
  otherAid: z
    .number()
    .min(0, "Le montant ne peut pas être négatif")
    .optional(),
  totalAid: z.number().min(0).optional(), // Calculé automatiquement
})

export type FinancialAidData = z.infer<typeof financialAidSchema>
