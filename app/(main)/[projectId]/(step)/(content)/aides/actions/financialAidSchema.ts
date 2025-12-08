import { z } from "zod"
import { TypeLogement } from "@/app/(main)/[projectId]/(step)/(content)/logement/types/logement"

export const financialAidSchema = z.object({
  // Critères d'éligibilité (optionnels car renseignés dans le calculateur)
  type_logement: z.nativeEnum(TypeLogement).optional(),
  surface_logement: z.number().min(0).optional(),
  revenu_fiscal_reference: z.number().min(0).optional(),
  residence_principale: z.boolean().optional(),
  remplacement_complet: z.boolean().optional(),

  // Montants des aides
  ma_prime_renov: z
    .number()
    .min(0, "Le montant ne peut pas être négatif")
    .optional(),
  cee: z
    .number()
    .min(0, "Le montant ne peut pas être négatif")
    .optional(),
  autres_aides: z
    .number()
    .min(0, "Le montant ne peut pas être négatif")
    .optional(),
  total_aides: z.number().min(0), // Calculé automatiquement
})

export type FinancialAidData = z.infer<typeof financialAidSchema>
