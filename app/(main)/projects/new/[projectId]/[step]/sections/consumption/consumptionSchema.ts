import { z } from "zod"

export const consumptionSchema = z.object({
  // Fioul
  conso_fioul_litres: z.number().optional(),
  prix_fioul_litre: z.number().optional(),
  // Gaz
  conso_gaz_kwh: z.number().optional(),
  prix_gaz_kwh: z.number().optional(),
  // GPL
  conso_gpl_kg: z.number().optional(),
  prix_gpl_kg: z.number().optional(),
  // Pellets
  conso_pellets_kg: z.number().optional(),
  prix_pellets_kg: z.number().optional(),
  // Bois
  conso_bois_steres: z.number().optional(),
  prix_bois_stere: z.number().optional(),
  // Electrique
  conso_elec_kwh: z.number().optional(),
  prix_elec_kwh: z.number().optional(),
  // PAC
  cop_actuel: z.number().optional(),
  conso_pac_kwh: z.number().optional(),
})

export type ConsumptionData = z.infer<typeof consumptionSchema>
