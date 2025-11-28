import { z } from "zod"

// Champs communs à tous les types de chauffage
const baseFields = {
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
  ]),
  age_installation: z
    .number({ message: "L'âge de l'installation est requis" })
    .min(0, "L'âge ne peut pas être négatif")
    .max(100, "L'âge ne peut pas dépasser 100 ans"),
  etat_installation: z.enum(["Bon", "Moyen", "Mauvais"], {
    message: "L'état de l'installation est requis",
  }),
  connait_consommation: z.boolean(),
  entretien_annuel: z
    .number({ message: "Le coût d'entretien annuel est requis" })
    .min(0)
    .max(500),
}

// Schéma quand l'utilisateur NE CONNAIT PAS sa consommation
const schemaWithoutConsumption = z
  .object({
    ...baseFields,
    // Tous les champs de consommation sont optionnels
    conso_fioul_litres: z.number().optional(),
    prix_fioul_litre: z.number().optional(),
    conso_gaz_kwh: z.number().optional(),
    prix_gaz_kwh: z.number().optional(),
    conso_gpl_kg: z.number().optional(),
    prix_gpl_kg: z.number().optional(),
    conso_pellets_kg: z.number().optional(),
    prix_pellets_kg: z.number().optional(),
    conso_bois_steres: z.number().optional(),
    prix_bois_stere: z.number().optional(),
    conso_elec_kwh: z.number().optional(),
    prix_elec_kwh: z.number().optional(),
    cop_actuel: z.number().optional(),
    conso_pac_kwh: z.number().optional(),
    abonnement_gaz: z.number().optional(),
  })
  .refine((data) => data.connait_consommation === false, {
    message: "Ce schéma s'applique uniquement quand connait_consommation est false",
    path: ["connait_consommation"],
  })

// Schéma pour Fioul (quand l'utilisateur CONNAIT sa consommation)
const fioulSchema = z
  .object({
    ...baseFields,
    conso_fioul_litres: z
      .number({ message: "La consommation de fioul est requise" })
      .min(0, "La consommation ne peut pas être négative")
      .max(50000, "La consommation semble trop élevée"),
    prix_fioul_litre: z
      .number({ message: "Le prix du fioul est requis" })
      .min(0, "Le prix ne peut pas être négatif")
      .max(10, "Le prix semble trop élevé"),
    // Autres champs optionnels
    conso_gaz_kwh: z.number().optional(),
    prix_gaz_kwh: z.number().optional(),
    conso_gpl_kg: z.number().optional(),
    prix_gpl_kg: z.number().optional(),
    conso_pellets_kg: z.number().optional(),
    prix_pellets_kg: z.number().optional(),
    conso_bois_steres: z.number().optional(),
    prix_bois_stere: z.number().optional(),
    conso_elec_kwh: z.number().optional(),
    prix_elec_kwh: z.number().optional(),
    cop_actuel: z.number().optional(),
    conso_pac_kwh: z.number().optional(),
    abonnement_gaz: z.number().optional(),
  })
  .refine(
    (data) => data.type_chauffage === "Fioul" && data.connait_consommation === true,
    {
      message: "Ce schéma s'applique uniquement pour Fioul avec connait_consommation=true",
      path: ["type_chauffage"],
    }
  )

// Schéma pour Gaz
const gazSchema = z
  .object({
    ...baseFields,
    conso_gaz_kwh: z
      .number({ message: "La consommation de gaz est requise" })
      .min(0, "La consommation ne peut pas être négative")
      .max(100000, "La consommation semble trop élevée"),
    prix_gaz_kwh: z
      .number({ message: "Le prix du gaz est requis" })
      .min(0, "Le prix ne peut pas être négatif")
      .max(1, "Le prix semble trop élevé"),
    abonnement_gaz: z
      .number({ message: "L'abonnement gaz est requis" })
      .min(0)
      .max(1000),
    // Autres champs optionnels
    conso_fioul_litres: z.number().optional(),
    prix_fioul_litre: z.number().optional(),
    conso_gpl_kg: z.number().optional(),
    prix_gpl_kg: z.number().optional(),
    conso_pellets_kg: z.number().optional(),
    prix_pellets_kg: z.number().optional(),
    conso_bois_steres: z.number().optional(),
    prix_bois_stere: z.number().optional(),
    conso_elec_kwh: z.number().optional(),
    prix_elec_kwh: z.number().optional(),
    cop_actuel: z.number().optional(),
    conso_pac_kwh: z.number().optional(),
  })
  .refine(
    (data) => data.type_chauffage === "Gaz" && data.connait_consommation === true,
    {
      message: "Ce schéma s'applique uniquement pour Gaz avec connait_consommation=true",
      path: ["type_chauffage"],
    }
  )

// Schéma pour GPL
const gplSchema = z
  .object({
    ...baseFields,
    conso_gpl_kg: z
      .number({ message: "La consommation de GPL est requise" })
      .min(0, "La consommation ne peut pas être négative")
      .max(10000, "La consommation semble trop élevée"),
    prix_gpl_kg: z
      .number({ message: "Le prix du GPL est requis" })
      .min(0, "Le prix ne peut pas être négatif")
      .max(10, "Le prix semble trop élevé"),
    // Autres champs optionnels
    conso_fioul_litres: z.number().optional(),
    prix_fioul_litre: z.number().optional(),
    conso_gaz_kwh: z.number().optional(),
    prix_gaz_kwh: z.number().optional(),
    conso_pellets_kg: z.number().optional(),
    prix_pellets_kg: z.number().optional(),
    conso_bois_steres: z.number().optional(),
    prix_bois_stere: z.number().optional(),
    conso_elec_kwh: z.number().optional(),
    prix_elec_kwh: z.number().optional(),
    cop_actuel: z.number().optional(),
    conso_pac_kwh: z.number().optional(),
    abonnement_gaz: z.number().optional(),
  })
  .refine(
    (data) => data.type_chauffage === "GPL" && data.connait_consommation === true,
    {
      message: "Ce schéma s'applique uniquement pour GPL avec connait_consommation=true",
      path: ["type_chauffage"],
    }
  )

// Schéma pour Pellets
const pelletsSchema = z
  .object({
    ...baseFields,
    conso_pellets_kg: z
      .number({ message: "La consommation de pellets est requise" })
      .min(0, "La consommation ne peut pas être négative")
      .max(20000, "La consommation semble trop élevée"),
    prix_pellets_kg: z
      .number({ message: "Le prix des pellets est requis" })
      .min(0, "Le prix ne peut pas être négatif")
      .max(2, "Le prix semble trop élevé"),
    // Autres champs optionnels
    conso_fioul_litres: z.number().optional(),
    prix_fioul_litre: z.number().optional(),
    conso_gaz_kwh: z.number().optional(),
    prix_gaz_kwh: z.number().optional(),
    conso_gpl_kg: z.number().optional(),
    prix_gpl_kg: z.number().optional(),
    conso_bois_steres: z.number().optional(),
    prix_bois_stere: z.number().optional(),
    conso_elec_kwh: z.number().optional(),
    prix_elec_kwh: z.number().optional(),
    cop_actuel: z.number().optional(),
    conso_pac_kwh: z.number().optional(),
    abonnement_gaz: z.number().optional(),
  })
  .refine(
    (data) => data.type_chauffage === "Pellets" && data.connait_consommation === true,
    {
      message: "Ce schéma s'applique uniquement pour Pellets avec connait_consommation=true",
      path: ["type_chauffage"],
    }
  )

// Schéma pour Bois
const boisSchema = z
  .object({
    ...baseFields,
    conso_bois_steres: z
      .number({ message: "La consommation de bois est requise" })
      .min(0, "La consommation ne peut pas être négative")
      .max(100, "La consommation semble trop élevée"),
    prix_bois_stere: z
      .number({ message: "Le prix du bois est requis" })
      .min(0, "Le prix ne peut pas être négatif")
      .max(500, "Le prix semble trop élevé"),
    // Autres champs optionnels
    conso_fioul_litres: z.number().optional(),
    prix_fioul_litre: z.number().optional(),
    conso_gaz_kwh: z.number().optional(),
    prix_gaz_kwh: z.number().optional(),
    conso_gpl_kg: z.number().optional(),
    prix_gpl_kg: z.number().optional(),
    conso_pellets_kg: z.number().optional(),
    prix_pellets_kg: z.number().optional(),
    conso_elec_kwh: z.number().optional(),
    prix_elec_kwh: z.number().optional(),
    cop_actuel: z.number().optional(),
    conso_pac_kwh: z.number().optional(),
    abonnement_gaz: z.number().optional(),
  })
  .refine(
    (data) => data.type_chauffage === "Bois" && data.connait_consommation === true,
    {
      message: "Ce schéma s'applique uniquement pour Bois avec connait_consommation=true",
      path: ["type_chauffage"],
    }
  )

// Schéma pour Électrique
const electriqueSchema = z
  .object({
    ...baseFields,
    conso_elec_kwh: z
      .number({ message: "La consommation électrique est requise" })
      .min(0, "La consommation ne peut pas être négative")
      .max(100000, "La consommation semble trop élevée"),
    prix_elec_kwh: z
      .number({ message: "Le prix de l'électricité est requis" })
      .min(0, "Le prix ne peut pas être négatif")
      .max(1, "Le prix semble trop élevé"),
    // Autres champs optionnels
    conso_fioul_litres: z.number().optional(),
    prix_fioul_litre: z.number().optional(),
    conso_gaz_kwh: z.number().optional(),
    prix_gaz_kwh: z.number().optional(),
    conso_gpl_kg: z.number().optional(),
    prix_gpl_kg: z.number().optional(),
    conso_pellets_kg: z.number().optional(),
    prix_pellets_kg: z.number().optional(),
    conso_bois_steres: z.number().optional(),
    prix_bois_stere: z.number().optional(),
    cop_actuel: z.number().optional(),
    conso_pac_kwh: z.number().optional(),
    abonnement_gaz: z.number().optional(),
  })
  .refine(
    (data) => data.type_chauffage === "Electrique" && data.connait_consommation === true,
    {
      message: "Ce schéma s'applique uniquement pour Electrique avec connait_consommation=true",
      path: ["type_chauffage"],
    }
  )

// Schémas pour PAC (Air/Air, Air/Eau, Eau/Eau)
const pacAirAirSchema = z
  .object({
    ...baseFields,
    cop_actuel: z
      .number({ message: "Le COP actuel est requis" })
      .min(1, "Le COP doit être au moins de 1")
      .max(10, "Le COP ne peut pas dépasser 10"),
    conso_pac_kwh: z
      .number({ message: "La consommation de la PAC est requise" })
      .min(0, "La consommation ne peut pas être négative")
      .max(100000, "La consommation semble trop élevée"),
    prix_elec_kwh: z
      .number({ message: "Le prix de l'électricité est requis" })
      .min(0, "Le prix ne peut pas être négatif")
      .max(1, "Le prix semble trop élevé"),
    // Autres champs optionnels
    conso_fioul_litres: z.number().optional(),
    prix_fioul_litre: z.number().optional(),
    conso_gaz_kwh: z.number().optional(),
    prix_gaz_kwh: z.number().optional(),
    conso_gpl_kg: z.number().optional(),
    prix_gpl_kg: z.number().optional(),
    conso_pellets_kg: z.number().optional(),
    prix_pellets_kg: z.number().optional(),
    conso_bois_steres: z.number().optional(),
    prix_bois_stere: z.number().optional(),
    conso_elec_kwh: z.number().optional(),
    abonnement_gaz: z.number().optional(),
  })
  .refine(
    (data) => data.type_chauffage === "PAC Air/Air" && data.connait_consommation === true,
    {
      message: "Ce schéma s'applique uniquement pour PAC Air/Air avec connait_consommation=true",
      path: ["type_chauffage"],
    }
  )

const pacAirEauSchema = z
  .object({
    ...baseFields,
    cop_actuel: z
      .number({ message: "Le COP actuel est requis" })
      .min(1, "Le COP doit être au moins de 1")
      .max(10, "Le COP ne peut pas dépasser 10"),
    conso_pac_kwh: z
      .number({ message: "La consommation de la PAC est requise" })
      .min(0, "La consommation ne peut pas être négative")
      .max(100000, "La consommation semble trop élevée"),
    prix_elec_kwh: z
      .number({ message: "Le prix de l'électricité est requis" })
      .min(0, "Le prix ne peut pas être négatif")
      .max(1, "Le prix semble trop élevé"),
    // Autres champs optionnels
    conso_fioul_litres: z.number().optional(),
    prix_fioul_litre: z.number().optional(),
    conso_gaz_kwh: z.number().optional(),
    prix_gaz_kwh: z.number().optional(),
    conso_gpl_kg: z.number().optional(),
    prix_gpl_kg: z.number().optional(),
    conso_pellets_kg: z.number().optional(),
    prix_pellets_kg: z.number().optional(),
    conso_bois_steres: z.number().optional(),
    prix_bois_stere: z.number().optional(),
    conso_elec_kwh: z.number().optional(),
    abonnement_gaz: z.number().optional(),
  })
  .refine(
    (data) => data.type_chauffage === "PAC Air/Eau" && data.connait_consommation === true,
    {
      message: "Ce schéma s'applique uniquement pour PAC Air/Eau avec connait_consommation=true",
      path: ["type_chauffage"],
    }
  )

const pacEauEauSchema = z
  .object({
    ...baseFields,
    cop_actuel: z
      .number({ message: "Le COP actuel est requis" })
      .min(1, "Le COP doit être au moins de 1")
      .max(10, "Le COP ne peut pas dépasser 10"),
    conso_pac_kwh: z
      .number({ message: "La consommation de la PAC est requise" })
      .min(0, "La consommation ne peut pas être négative")
      .max(100000, "La consommation semble trop élevée"),
    prix_elec_kwh: z
      .number({ message: "Le prix de l'électricité est requis" })
      .min(0, "Le prix ne peut pas être négatif")
      .max(1, "Le prix semble trop élevé"),
    // Autres champs optionnels
    conso_fioul_litres: z.number().optional(),
    prix_fioul_litre: z.number().optional(),
    conso_gaz_kwh: z.number().optional(),
    prix_gaz_kwh: z.number().optional(),
    conso_gpl_kg: z.number().optional(),
    prix_gpl_kg: z.number().optional(),
    conso_pellets_kg: z.number().optional(),
    prix_pellets_kg: z.number().optional(),
    conso_bois_steres: z.number().optional(),
    prix_bois_stere: z.number().optional(),
    conso_elec_kwh: z.number().optional(),
    abonnement_gaz: z.number().optional(),
  })
  .refine(
    (data) => data.type_chauffage === "PAC Eau/Eau" && data.connait_consommation === true,
    {
      message: "Ce schéma s'applique uniquement pour PAC Eau/Eau avec connait_consommation=true",
      path: ["type_chauffage"],
    }
  )

// Union discriminée sur connait_consommation ET type_chauffage
export const currentHeatingSchema = z.union([
  schemaWithoutConsumption,
  fioulSchema,
  gazSchema,
  gplSchema,
  pelletsSchema,
  boisSchema,
  electriqueSchema,
  pacAirAirSchema,
  pacAirEauSchema,
  pacEauEauSchema,
])

export type CurrentHeatingData = z.infer<typeof currentHeatingSchema>
