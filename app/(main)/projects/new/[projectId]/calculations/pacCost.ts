import { ProjectData } from "./types"
import { calculateCurrentAnnualCost } from "./currentCost"

/**
 * Calcule la consommation énergétique annuelle actuelle en kWh
 * Convertit toutes les énergies en kWh pour le calcul PAC
 * @param data Données du projet
 * @returns Consommation en kWh
 */
export function calculateCurrentConsumptionKwh(data: ProjectData): number {
  switch (data.type_chauffage) {
    case "Fioul":
      // 1 litre de fioul ≈ 10 kWh
      return (data.conso_fioul_litres || 0) * 10

    case "Gaz":
      return data.conso_gaz_kwh || 0

    case "GPL":
      // 1 kg de GPL ≈ 12.8 kWh
      return (data.conso_gpl_kg || 0) * 12.8

    case "Pellets":
      // 1 kg de pellets ≈ 4.8 kWh
      return (data.conso_pellets_kg || 0) * 4.8

    case "Bois":
      // 1 stère de bois ≈ 1800 kWh
      return (data.conso_bois_steres || 0) * 1800

    case "Electrique":
      return data.conso_elec_kwh || 0

    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      // Si déjà une PAC, on utilise la consommation actuelle * COP actuel pour retrouver les besoins
      return (data.conso_pac_kwh || 0) * (data.cop_actuel || 1)

    default:
      return 0
  }
}

/**
 * Calcule la consommation électrique annuelle de la PAC
 * Formule: Consommation PAC = Besoins énergétiques / COP estimé
 * @param data Données du projet
 * @returns Consommation PAC en kWh
 */
export function calculatePacConsumptionKwh(data: ProjectData): number {
  const currentConsumptionKwh = calculateCurrentConsumptionKwh(data)
  return currentConsumptionKwh / data.cop_estime
}

/**
 * Calcule le coût annuel du chauffage avec PAC
 * @param data Données du projet
 * @returns Coût annuel en euros
 */
export function calculatePacAnnualCost(data: ProjectData): number {
  const pacConsumption = calculatePacConsumptionKwh(data)
  return pacConsumption * (data.prix_elec_kwh || 0)
}

/**
 * Calcule le coût PAC pour une année donnée avec évolution du prix de l'électricité
 * @param data Données du projet
 * @param year Année de projection (0 = année actuelle)
 * @returns Coût projeté en euros
 */
export function calculatePacCostForYear(data: ProjectData, year: number): number {
  const baseCost = calculatePacAnnualCost(data)
  const evolution = data.evolution_prix_electricite || 0
  return baseCost * Math.pow(1 + evolution / 100, year)
}
