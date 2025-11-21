import { z } from "zod"

// Logement section
export const logementSchema = z.object({
  departement: z.string().min(1, "Le département est requis"),
  annee_construction: z.number().min(1800).max(2100),
  surface_habitable: z.number().min(1),
  nombre_occupants: z.number().min(1),
  isolation_murs: z.boolean(),
  isolation_combles: z.boolean(),
  double_vitrage: z.boolean(),
})

// Chauffage actuel section
export const chauffageActuelSchema = z.object({
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
    "Autre",
  ]),
  age_installation: z.number().min(0),
  etat_installation: z.enum(["Bon", "Moyen", "Mauvais"]),
})

// Consommation section with conditional fields
export const consommationSchema = z.object({
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

// Projet PAC section
export const projetPacSchema = z.object({
  type_pac: z.enum(["Air/Eau", "Eau/Eau", "Air/Air"]),
  puissance_pac_kw: z.number().min(1),
  cop_estime: z.number().min(1).max(10),
  temperature_depart: z.number().min(30).max(80),
  emetteurs: z.enum([
    "Radiateurs haute température",
    "Radiateurs basse température",
    "Plancher chauffant",
    "Ventilo-convecteurs",
  ]),
  ballon_ecs: z.boolean(),
  volume_ballon: z.number().optional(),
})

// Couts section
export const coutsSchema = z.object({
  cout_pac: z.number().min(0),
  cout_installation: z.number().min(0),
  cout_travaux_annexes: z.number().optional(),
  cout_total: z.number().min(0),
})

// Aides section
export const aidesSchema = z.object({
  ma_prime_renov: z.number().min(0).optional(),
  cee: z.number().min(0).optional(),
  autres_aides: z.number().min(0).optional(),
  total_aides: z.number().min(0),
  reste_a_charge: z.number().min(0),
})

// Financement section
export const financementSchema = z.object({
  mode_financement: z.enum(["Comptant", "Crédit", "Mixte"]),
  apport_personnel: z.number().min(0).optional(),
  montant_credit: z.number().min(0).optional(),
  taux_interet: z.number().min(0).max(100).optional(),
  duree_credit_mois: z.number().min(1).max(360).optional(),
  mensualite: z.number().min(0).optional(),
})

// Evolutions section
export const evolutionsSchema = z.object({
  evolution_prix_energie: z.number().min(-50).max(50),
  evolution_prix_electricite: z.number().min(-50).max(50),
  duree_etude_annees: z.number().min(1).max(30),
})

// Main form schema combining all sections
export const heatingFormSchema = z.object({
  logement: logementSchema,
  chauffage_actuel: chauffageActuelSchema,
  consommation: consommationSchema,
  projet_pac: projetPacSchema,
  couts: coutsSchema,
  aides: aidesSchema,
  financement: financementSchema,
  evolutions: evolutionsSchema,
})

export type HeatingFormData = z.infer<typeof heatingFormSchema>
