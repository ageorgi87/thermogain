import { z } from "zod"

export const financialAidSchema = z.object({
  ma_prime_renov: z.number().min(0).optional(),
  cee: z.number().min(0).optional(),
  autres_aides: z.number().min(0).optional(),
  total_aides: z.number().min(0),
  reste_a_charge: z.number().min(0),
})

export type FinancialAidData = z.infer<typeof financialAidSchema>
