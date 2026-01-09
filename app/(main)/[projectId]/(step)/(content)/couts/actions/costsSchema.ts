import { z } from "zod"

export const costsSchema = z.object({
  heatPumpCost: z
    .number({ message: "Le coût de la PAC est requis" })
    .min(0, "Le coût ne peut pas être négatif"),
  installationCost: z
    .number()
    .min(0, "Le coût ne peut pas être négatif")
    .optional(),
  additionalWorkCost: z
    .number()
    .min(0, "Le coût ne peut pas être négatif")
    .optional(),
  totalCost: z.number().min(0),
})

export type CostsData = z.infer<typeof costsSchema>
