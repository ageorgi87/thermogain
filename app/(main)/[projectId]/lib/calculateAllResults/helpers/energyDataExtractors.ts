import type { ProjectData } from "@/types/projectData"
import { ENERGY_CONVERSION_FACTORS } from "@/config/constants"

/**
 * Extracteurs de données énergétiques
 * Centralise la logique d'extraction des données de consommation et prix selon le type d'énergie
 */

/**
 * Extrait la consommation en kWh selon le type de chauffage actuel
 * @param data Données du projet
 * @param forPacCalculation Si true, pour une PAC existante, retourne les besoins énergétiques (conso * COP actuel)
 */
export const getCurrentConsumptionKwh = (
  data: ProjectData,
  forPacCalculation = false
): number => {
  switch (data.type_chauffage) {
    case "Fioul":
      return (data.conso_fioul_litres || 0) * ENERGY_CONVERSION_FACTORS.FIOUL_KWH_PER_LITRE

    case "Gaz":
      return data.conso_gaz_kwh || 0

    case "GPL":
      return (data.conso_gpl_kg || 0) * ENERGY_CONVERSION_FACTORS.GPL_KWH_PER_KG

    case "Bois":
      return (data.conso_bois_steres || 0) * ENERGY_CONVERSION_FACTORS.BOIS_KWH_PER_STERE

    case "Pellets":
      return (data.conso_pellets_kg || 0) * ENERGY_CONVERSION_FACTORS.PELLETS_KWH_PER_KG

    case "Electrique":
      return data.conso_elec_kwh || 0

    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      // Si déjà une PAC et qu'on calcule les besoins énergétiques pour la nouvelle PAC
      if (forPacCalculation) {
        return (data.conso_pac_kwh || 0) * (data.cop_actuel || 1)
      }
      return data.conso_pac_kwh || 0

    default:
      console.warn(`Type de chauffage non reconnu: ${data.type_chauffage}`)
      return 0
  }
}

/**
 * Extrait le coût variable annuel (énergie) selon le type de chauffage actuel
 */
export const getCurrentVariableCost = (data: ProjectData): number => {
  switch (data.type_chauffage) {
    case "Fioul":
      return (data.conso_fioul_litres || 0) * (data.prix_fioul_litre || 0)

    case "Gaz":
      return (data.conso_gaz_kwh || 0) * (data.prix_gaz_kwh || 0)

    case "GPL":
      return (data.conso_gpl_kg || 0) * (data.prix_gpl_kg || 0)

    case "Bois":
      return (data.conso_bois_steres || 0) * (data.prix_bois_stere || 0)

    case "Pellets":
      return (data.conso_pellets_kg || 0) * (data.prix_pellets_kg || 0)

    case "Electrique":
      return (data.conso_elec_kwh || 0) * (data.prix_elec_kwh || 0)

    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      return (data.conso_pac_kwh || 0) * (data.prix_elec_kwh || 0)

    default:
      console.warn(`Type de chauffage non reconnu: ${data.type_chauffage}`)
      return 0
  }
}

/**
 * Extrait le prix unitaire de l'énergie selon le type de chauffage
 */
export const getCurrentEnergyPrice = (data: ProjectData): number => {
  switch (data.type_chauffage) {
    case "Fioul":
      return data.prix_fioul_litre || 0

    case "Gaz":
      return data.prix_gaz_kwh || 0

    case "GPL":
      return data.prix_gpl_kg || 0

    case "Bois":
      return data.prix_bois_stere || 0

    case "Pellets":
      return data.prix_pellets_kg || 0

    case "Electrique":
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      return data.prix_elec_kwh || 0

    default:
      console.warn(`Type de chauffage non reconnu: ${data.type_chauffage}`)
      return 0
  }
}
