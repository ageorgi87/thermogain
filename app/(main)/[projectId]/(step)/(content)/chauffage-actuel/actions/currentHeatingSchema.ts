import { z } from "zod"
import { TypeChauffageActuel } from "@/types/typeChauffageActuel"

export const currentHeatingSchema = z.object({
  heatingType: z.nativeEnum(TypeChauffageActuel, {
    message: "Le type de chauffage est requis",
  }),
  installationAge: z
    .number({ message: "L'âge de l'installation est requis" })
    .min(0, "L'âge ne peut pas être négatif")
    .max(100, "L'âge ne peut pas dépasser 100 ans"),
  installationCondition: z.enum(["Bon", "Moyen", "Mauvais"], {
    message: "L'état de l'installation est requis",
  }),

  // DHW (Domestic Hot Water) integration
  // true = DHW integrated in heating system (mixed boiler), false = separate DHW system
  // Only asked if future heat pump will manage DHW (from step 1: with_ecs_management = true)
  dhwIntegrated: z.boolean().optional(),

  annualMaintenance: z
    .number({ message: "Le coût d'entretien annuel est requis" })
    .min(0)
    .max(500),

  // Optional consumption fields - become required based on heating type
  fuelConsumptionLiters: z.number().min(0).max(50000).nullable().optional(),
  fuelPricePerLiter: z.number().min(0).max(10).nullable().optional(),
  gasConsumptionKwh: z.number().min(0).max(100000).nullable().optional(),
  gasPricePerKwh: z.number().min(0).max(1).nullable().optional(),
  lpgConsumptionKg: z.number().min(0).max(10000).nullable().optional(),
  lpgPricePerKg: z.number().min(0).max(10).nullable().optional(),
  pelletsConsumptionKg: z.number().min(0).max(20000).nullable().optional(),
  pelletsPricePerKg: z.number().min(0).max(2).nullable().optional(),
  woodConsumptionSteres: z.number().min(0).max(100).nullable().optional(),
  woodPricePerStere: z.number().min(0).max(500).nullable().optional(),
  electricityConsumptionKwh: z.number().min(0).max(100000).nullable().optional(),
  electricityPricePerKwh: z.number().min(0).max(1).nullable().optional(),
  currentCop: z.number().min(1).max(10).nullable().optional(),
  heatPumpConsumptionKwh: z.number().min(0).max(100000).nullable().optional(),
  gasSubscription: z.number().min(0).max(1000).nullable().optional(),
}).superRefine((data, ctx) => {
  // Validation based on heating type
  const type = data.heatingType

  // Fioul
  if (type === TypeChauffageActuel.FIOUL) {
    if (data.fuelConsumptionLiters === undefined || data.fuelConsumptionLiters === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation de fioul est requise",
        path: ["fuelConsumptionLiters"],
      })
    }
    if (data.fuelPricePerLiter === undefined || data.fuelPricePerLiter === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix du fioul est requis",
        path: ["fuelPricePerLiter"],
      })
    }
  }

  // Gaz
  if (type === TypeChauffageActuel.GAZ) {
    if (data.gasConsumptionKwh === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation de gaz est requise",
        path: ["gasConsumptionKwh"],
      })
    }
    if (data.gasPricePerKwh === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix du gaz est requis",
        path: ["gasPricePerKwh"],
      })
    }
    if (data.gasSubscription === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'abonnement gaz est requis",
        path: ["gasSubscription"],
      })
    }
  }

  // GPL
  if (type === TypeChauffageActuel.GPL) {
    if (data.lpgConsumptionKg === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation de GPL est requise",
        path: ["lpgConsumptionKg"],
      })
    }
    if (data.lpgPricePerKg === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix du GPL est requis",
        path: ["lpgPricePerKg"],
      })
    }
  }

  // Pellets
  if (type === TypeChauffageActuel.PELLETS) {
    if (data.pelletsConsumptionKg === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation de pellets est requise",
        path: ["pelletsConsumptionKg"],
      })
    }
    if (data.pelletsPricePerKg === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix des pellets est requis",
        path: ["pelletsPricePerKg"],
      })
    }
  }

  // Bois
  if (type === TypeChauffageActuel.BOIS) {
    if (data.woodConsumptionSteres === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation de bois est requise",
        path: ["woodConsumptionSteres"],
      })
    }
    if (data.woodPricePerStere === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix du bois est requis",
        path: ["woodPricePerStere"],
      })
    }
  }

  // Electrique
  if (type === TypeChauffageActuel.ELECTRIQUE) {
    if (data.electricityConsumptionKwh === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation électrique est requise",
        path: ["electricityConsumptionKwh"],
      })
    }
    if (data.electricityPricePerKwh === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix de l'électricité est requis",
        path: ["electricityPricePerKwh"],
      })
    }
  }

  // PAC (Air/Air, Air/Eau, Eau/Eau) - all have the same fields
  if (type === TypeChauffageActuel.PAC_AIR_AIR || type === TypeChauffageActuel.PAC_AIR_EAU || type === TypeChauffageActuel.PAC_EAU_EAU) {
    if (data.currentCop === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le COP actuel est requis",
        path: ["currentCop"],
      })
    }
    if (data.heatPumpConsumptionKwh === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation de la PAC est requise",
        path: ["heatPumpConsumptionKwh"],
      })
    }
    if (data.electricityPricePerKwh === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix de l'électricité est requis",
        path: ["electricityPricePerKwh"],
      })
    }
  }
})

export type CurrentHeatingData = z.infer<typeof currentHeatingSchema>
