import { z } from "zod"

export const costsSchema = z.object({
  cout_pac: z.number().min(0),
  cout_installation: z.number().min(0),
  cout_travaux_annexes: z.number().optional(),
  cout_total: z.number().min(0),
})

export type CostsData = z.infer<typeof costsSchema>
