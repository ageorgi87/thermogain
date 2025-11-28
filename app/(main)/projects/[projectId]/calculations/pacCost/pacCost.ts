import { ProjectData } from "../types"
import { calculateCurrentAnnualCost } from "../currentCost/currentCost"
import { getDeltaAbonnementElectricite, getAbonnementElectriciteAnnuel } from "@/lib/subscriptionRates"
import { getElectricityModelSync } from "@/lib/energyModelCache"
import { calculateCostForYear } from "@/lib/energyPriceEvolution"

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
 * Calcule le coût VARIABLE annuel du chauffage avec PAC (électricité uniquement, sans coûts fixes)
 * @param data Données du projet
 * @returns Coût variable annuel en euros
 */
export function calculatePacVariableCost(data: ProjectData): number {
  const pacConsumption = calculatePacConsumptionKwh(data)
  // Utilise le prix électricité PAC si renseigné, sinon le prix électricité actuel
  const prixElec = data.prix_elec_pac || data.prix_elec_kwh || 0
  return pacConsumption * prixElec
}

/**
 * Calcule les coûts FIXES annuels de la PAC
 * Inclut:
 * - Abonnement électricité (puissance nécessaire pour la PAC)
 * - Entretien annuel PAC
 *
 * Note: L'abonnement gaz est supprimé (économie comptabilisée dans la comparaison)
 *
 * @param data Données du projet
 * @returns Objet détaillant les coûts fixes de la PAC
 */
export function calculatePacFixedCosts(data: ProjectData): {
  abonnementElec: number
  entretien: number
  total: number
} {
  const puissancePac = data.puissance_souscrite_pac || 9

  // Abonnement électricité avec PAC (puissance augmentée)
  const abonnementElec = getAbonnementElectriciteAnnuel(puissancePac)

  // Entretien PAC
  const entretien = data.entretien_pac_annuel || 120

  return {
    abonnementElec,
    entretien,
    total: abonnementElec + entretien
  }
}

/**
 * Calcule le coût annuel TOTAL du chauffage avec PAC
 * Inclut les coûts variables (électricité) ET les coûts fixes (abonnement électricité + entretien PAC)
 *
 * @param data Données du projet
 * @returns Coût total annuel en euros
 */
export function calculatePacAnnualCost(data: ProjectData): number {
  const variableCost = calculatePacVariableCost(data)
  const fixedCosts = calculatePacFixedCosts(data)
  return variableCost + fixedCosts.total
}

/**
 * Calcule le coût PAC pour une année donnée avec évolution du prix de l'électricité
 *
 * NOUVEAU (Décembre 2024): Utilise le modèle Mean Reversion basé sur l'historique
 * complet de l'API DIDO-SDES (18+ ans de données) au lieu d'un taux linéaire constant.
 *
 * Le modèle applique:
 * - Taux récent (6,9%/an) sur les 5 premières années
 * - Transition progressive vers le taux d'équilibre (2,5%/an)
 * - Taux d'équilibre stabilisé après 5 ans
 *
 * IMPORTANT: Seuls les coûts VARIABLES (électricité) évoluent avec le temps.
 * Les coûts FIXES (abonnement, entretien) restent constants en euros constants.
 *
 * @param data Données du projet
 * @param year Année de projection (0 = année actuelle)
 * @returns Coût projeté en euros
 */
export function calculatePacCostForYear(data: ProjectData, year: number): number {
  // Coûts variables: évoluent avec le modèle Mean Reversion
  const variableCost = calculatePacVariableCost(data)
  const fixedCosts = calculatePacFixedCosts(data)

  // Récupérer le modèle Mean Reversion depuis l'API DIDO
  const model = getElectricityModelSync()

  // Utiliser la fonction de calcul qui applique le modèle Mean Reversion
  return calculateCostForYear(
    variableCost,
    fixedCosts.total,
    year,
    model
  )
}
