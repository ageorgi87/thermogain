import { z } from "zod"

export const costsSchema = z.object({
  cout_pac: z
    .number({ message: "Le coût de la PAC est requis" })
    .min(0, "Le coût ne peut pas être négatif"),
  cout_installation: z
    .number()
    .min(0, "Le coût ne peut pas être négatif")
    .optional(),
  cout_travaux_annexes: z
    .number()
    .min(0, "Le coût ne peut pas être négatif")
    .optional(),
  cout_total: z.number().min(0),
})

export type CostsData = z.infer<typeof costsSchema>
