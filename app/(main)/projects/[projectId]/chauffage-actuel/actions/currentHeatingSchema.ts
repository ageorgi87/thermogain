import { z } from "zod"

export const currentHeatingSchema = z.object({
  type_chauffage: z.enum([
    "Fioul",
    "Gaz",
    "GPL",
    "Pellets",
    "Bois",
    "Electrique",
    "PAC Air/Air",
    "PAC Air/Eau",
    "PAC Eau/Eau",
  ], {
    message: "Le type de chauffage est requis",
  }),
  age_installation: z
    .number({ message: "L'âge de l'installation est requis" })
    .min(0, "L'âge ne peut pas être négatif")
    .max(100, "L'âge ne peut pas dépasser 100 ans"),
  etat_installation: z.enum(["Bon", "Moyen", "Mauvais"], {
    message: "L'état de l'installation est requis",
  }),
  connait_consommation: z.boolean({
    message: "Veuillez indiquer si vous connaissez votre consommation",
  }),
  entretien_annuel: z
    .number({ message: "Le coût d'entretien annuel est requis" })
    .min(0)
    .max(500),

  // Tous les champs de consommation sont optionnels de base
  // Ils deviennent requis selon le type de chauffage ET si connait_consommation = true
  conso_fioul_litres: z.number().min(0).max(50000).optional(),
  prix_fioul_litre: z.number().min(0).max(10).optional(),
  conso_gaz_kwh: z.number().min(0).max(100000).optional(),
  prix_gaz_kwh: z.number().min(0).max(1).optional(),
  conso_gpl_kg: z.number().min(0).max(10000).optional(),
  prix_gpl_kg: z.number().min(0).max(10).optional(),
  conso_pellets_kg: z.number().min(0).max(20000).optional(),
  prix_pellets_kg: z.number().min(0).max(2).optional(),
  conso_bois_steres: z.number().min(0).max(100).optional(),
  prix_bois_stere: z.number().min(0).max(500).optional(),
  conso_elec_kwh: z.number().min(0).max(100000).optional(),
  prix_elec_kwh: z.number().min(0).max(1).optional(),
  cop_actuel: z.number().min(1).max(10).optional(),
  conso_pac_kwh: z.number().min(0).max(100000).optional(),
  abonnement_gaz: z.number().min(0).max(1000).optional(),
}).superRefine((data, ctx) => {
  // Si l'utilisateur ne connaît pas sa consommation, on ne valide rien de plus
  if (!data.connait_consommation) {
    return
  }

  // Si connait_consommation = true, on valide selon le type de chauffage
  const type = data.type_chauffage

  // Fioul
  if (type === "Fioul") {
    if (data.conso_fioul_litres === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation de fioul est requise",
        path: ["conso_fioul_litres"],
      })
    }
    if (data.prix_fioul_litre === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix du fioul est requis",
        path: ["prix_fioul_litre"],
      })
    }
  }

  // Gaz
  if (type === "Gaz") {
    if (data.conso_gaz_kwh === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation de gaz est requise",
        path: ["conso_gaz_kwh"],
      })
    }
    if (data.prix_gaz_kwh === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix du gaz est requis",
        path: ["prix_gaz_kwh"],
      })
    }
    if (data.abonnement_gaz === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'abonnement gaz est requis",
        path: ["abonnement_gaz"],
      })
    }
  }

  // GPL
  if (type === "GPL") {
    if (data.conso_gpl_kg === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation de GPL est requise",
        path: ["conso_gpl_kg"],
      })
    }
    if (data.prix_gpl_kg === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix du GPL est requis",
        path: ["prix_gpl_kg"],
      })
    }
  }

  // Pellets
  if (type === "Pellets") {
    if (data.conso_pellets_kg === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation de pellets est requise",
        path: ["conso_pellets_kg"],
      })
    }
    if (data.prix_pellets_kg === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix des pellets est requis",
        path: ["prix_pellets_kg"],
      })
    }
  }

  // Bois
  if (type === "Bois") {
    if (data.conso_bois_steres === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation de bois est requise",
        path: ["conso_bois_steres"],
      })
    }
    if (data.prix_bois_stere === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix du bois est requis",
        path: ["prix_bois_stere"],
      })
    }
  }

  // Electrique
  if (type === "Electrique") {
    if (data.conso_elec_kwh === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation électrique est requise",
        path: ["conso_elec_kwh"],
      })
    }
    if (data.prix_elec_kwh === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix de l'électricité est requis",
        path: ["prix_elec_kwh"],
      })
    }
  }

  // PAC (Air/Air, Air/Eau, Eau/Eau) - tous ont les mêmes champs
  if (type === "PAC Air/Air" || type === "PAC Air/Eau" || type === "PAC Eau/Eau") {
    if (data.cop_actuel === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le COP actuel est requis",
        path: ["cop_actuel"],
      })
    }
    if (data.conso_pac_kwh === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La consommation de la PAC est requise",
        path: ["conso_pac_kwh"],
      })
    }
    if (data.prix_elec_kwh === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le prix de l'électricité est requis",
        path: ["prix_elec_kwh"],
      })
    }
  }
})

export type CurrentHeatingData = z.infer<typeof currentHeatingSchema>
