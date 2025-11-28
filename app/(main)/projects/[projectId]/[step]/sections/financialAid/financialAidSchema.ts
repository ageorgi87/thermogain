import { z } from "zod"

export const financialAidSchema = z.object({
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
