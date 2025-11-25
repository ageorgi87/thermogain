import { z } from "zod"

export const financialAidSchema = z.object({
  ma_prime_renov: z.number().min(0, "Le montant ne peut pas être négatif").default(0),
  cee: z.number().min(0, "Le montant ne peut pas être négatif").default(0),
  autres_aides: z.number().min(0, "Le montant ne peut pas être négatif").default(0),
  total_aides: z.number().min(0).default(0), // Calculé automatiquement
})

export type FinancialAidData = z.infer<typeof financialAidSchema>
