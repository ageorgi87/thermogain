import { z } from "zod"
import { TypeLogement } from "@/app/(main)/[projectId]/(step)/(content)/logement/types/logement"

export const financialAidSchema = z.object({
  // Critères d'éligibilité (optionnels car renseignés dans le calculateur)
  housingType: z.nativeEnum(TypeLogement).optional(),
  referenceTaxIncome: z.number().min(0).optional(),
  isPrimaryResidence: z.boolean().optional(),
  isCompleteReplacement: z.boolean().optional(),

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
  totalAid: z.number().min(0), // Calculé automatiquement
})

export type FinancialAidData = z.infer<typeof financialAidSchema>
