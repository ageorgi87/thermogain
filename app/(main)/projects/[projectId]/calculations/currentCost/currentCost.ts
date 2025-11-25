import { ProjectData } from "../types"

/**
 * Calcule le coût annuel du chauffage actuel
 * @param data Données du projet
 * @returns Coût annuel en euros
 */
export function calculateCurrentAnnualCost(data: ProjectData): number {
  switch (data.type_chauffage) {
    case "Fioul":
      return (data.conso_fioul_litres || 0) * (data.prix_fioul_litre || 0)

    case "Gaz":
      return (data.conso_gaz_kwh || 0) * (data.prix_gaz_kwh || 0)

    case "GPL":
      return (data.conso_gpl_kg || 0) * (data.prix_gpl_kg || 0)

    case "Pellets":
      return (data.conso_pellets_kg || 0) * (data.prix_pellets_kg || 0)

    case "Bois":
      return (data.conso_bois_steres || 0) * (data.prix_bois_stere || 0)

    case "Electrique":
      return (data.conso_elec_kwh || 0) * (data.prix_elec_kwh || 0)

    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      return (data.conso_pac_kwh || 0) * (data.prix_elec_kwh || 0)

    default:
      return 0
  }
}

/**
 * Obtient le taux d'évolution du prix de l'énergie actuelle
 * @param data Données du projet
 * @returns Taux d'évolution annuel en pourcentage
 */
export function getCurrentEnergyEvolution(data: ProjectData): number {
  switch (data.type_chauffage) {
    case "Fioul":
      return data.evolution_prix_fioul || 0

    case "Gaz":
      return data.evolution_prix_gaz || 0

    case "GPL":
      return data.evolution_prix_gpl || 0

    case "Pellets":
    case "Bois":
      return data.evolution_prix_bois || 0

    case "Electrique":
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      return data.evolution_prix_electricite || 0

    default:
      return 0
  }
}

/**
 * Calcule le coût du chauffage actuel pour une année donnée
 * @param data Données du projet
 * @param year Année de projection (0 = année actuelle)
 * @returns Coût projeté en euros
 */
export function calculateCurrentCostForYear(data: ProjectData, year: number): number {
  const baseCost = calculateCurrentAnnualCost(data)
  const evolution = getCurrentEnergyEvolution(data)
  return baseCost * Math.pow(1 + evolution / 100, year)
}
