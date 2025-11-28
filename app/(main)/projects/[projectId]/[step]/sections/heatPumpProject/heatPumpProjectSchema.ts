import { z } from "zod"

export const heatPumpProjectSchema = z.object({
  type_pac: z.enum(["Air/Eau", "Eau/Eau", "Air/Air"]),

  // Prix électricité et puissance souscrite actuelle - déplacés depuis "Chauffage actuel"
  // Prix de l'électricité (€/kWh) - OBLIGATOIRE (nécessaire pour calculer le coût de la PAC)
  prix_elec_kwh: z.number()
    .min(0, "Le prix ne peut pas être négatif")
    .max(1, "Le prix semble trop élevé")
    .refine((val) => {
      const decimalPart = val.toString().split('.')[1]
      return !decimalPart || decimalPart.length <= 3
    }, "Le prix ne peut pas avoir plus de 3 décimales"),

  // Puissance souscrite électrique actuelle (en kVA)
  puissance_souscrite_actuelle: z.number().min(3).max(36).default(6),

  puissance_pac_kw: z.number().min(1).default(10),
  cop_estime: z.number().min(1).max(10).default(3),
  temperature_depart: z.number().min(30).max(80).optional(),
  emetteurs: z.enum([
    "Radiateurs haute température",
    "Radiateurs basse température",
    "Plancher chauffant",
    "Ventilo-convecteurs",
  ]).optional(),
  duree_vie_pac: z.number().min(5).max(30).default(17),

  // Nouveaux champs pour coûts fixes et abonnements (Novembre 2024)
  // Puissance souscrite électrique recommandée pour la PAC (en kVA: 6, 9, 12, 15, 18)
  // Calculée automatiquement selon puissance_pac_kw, mais modifiable par l'utilisateur
  puissance_souscrite_pac: z.number().min(3).max(36).default(9),

  // Coût d'entretien annuel de la PAC (€/an)
  // Valeur moyenne: 120€/an (entretien obligatoire annuel)
  entretien_pac_annuel: z.number().min(0).max(500).default(120),

  // Prix électricité pour la PAC (€/kWh) - peut être différent du prix actuel
  // Si non renseigné, utilisera le prix du système actuel
  prix_elec_pac: z.number()
    .min(0)
    .max(1)
    .refine((val) => {
      const decimalPart = val.toString().split('.')[1]
      return !decimalPart || decimalPart.length <= 3
    }, "Le prix ne peut pas avoir plus de 3 décimales")
    .optional(),
}).superRefine((data, ctx) => {
  // Temperature departure and emitters are required for water-based systems (Air/Eau, Eau/Eau)
  // Air/Air systems don't have water circuits, so these fields are not applicable
  const isWaterBased = data.type_pac === "Air/Eau" || data.type_pac === "Eau/Eau"

  if (isWaterBased) {
    if (!data.temperature_depart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La température de départ est requise pour les PAC hydrauliques (Air/Eau et Eau/Eau)",
        path: ["temperature_depart"],
      })
    }
    if (!data.emetteurs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le type d'émetteurs est requis pour les PAC hydrauliques",
        path: ["emetteurs"],
      })
    }
  }

  // For Air/Air systems, only "Ventilo-convecteurs" (splits) is valid if emetteurs is provided
  if (data.type_pac === "Air/Air" && data.emetteurs && data.emetteurs !== "Ventilo-convecteurs") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Les PAC Air/Air utilisent uniquement des unités intérieures (splits), pas de radiateurs ou plancher chauffant",
      path: ["emetteurs"],
    })
  }
})

export type HeatPumpProjectData = z.infer<typeof heatPumpProjectSchema>
