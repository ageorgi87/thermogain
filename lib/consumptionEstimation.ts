/**
 * Estimation de la consommation énergétique annuelle basée sur les caractéristiques du logement
 * Méthode inspirée du DPE (Diagnostic de Performance Énergétique) et des coefficients de déperdition thermique
 *
 * Prise en compte des zones climatiques françaises (H1, H2, H3) selon DPE 3CL-DPE 2021
 */

import { getConsumptionAdjustment } from "./climateZones"

interface HousingCharacteristics {
  surface_habitable: number
  annee_construction: number
  qualite_isolation: string // "Mauvaise", "Moyenne", "Bonne"
  nombre_occupants: number
  code_postal?: string // Optionnel pour ajustement climatique
}

/**
 * Calcule le coefficient de consommation en kWh/m²/an selon l'année de construction et l'isolation
 */
function getConsumptionCoefficient(
  anneeConstruction: number,
  qualiteIsolation: string
): number {
  // Convertir la qualité d'isolation en score numérique
  // "Mauvaise" = 0, "Moyenne" = 1-2, "Bonne" = 3
  let isolationScore: number
  if (qualiteIsolation === "Mauvaise") {
    isolationScore = 0
  } else if (qualiteIsolation === "Moyenne") {
    isolationScore = 1.5 // Moyenne entre 1 et 2
  } else {
    isolationScore = 3
  }

  // Logements construits avant 1975 (pas de RT)
  if (anneeConstruction < 1975) {
    if (isolationScore === 0) return 200 // Très mal isolé
    if (isolationScore <= 1.5) return 155 // Mal isolé (moyenne de 170 et 140)
    return 110 // Bien isolé après rénovation
  }

  // Logements construits entre 1975 et 2000 (RT 1974-2000)
  if (anneeConstruction < 2000) {
    if (isolationScore === 0) return 150 // Mal isolé
    if (isolationScore <= 1.5) return 120 // Isolation partielle (moyenne de 130 et 110)
    return 90 // Très bien isolé
  }

  // Logements construits entre 2000 et 2012 (RT 2000-2005)
  if (anneeConstruction < 2012) {
    if (isolationScore === 0) return 100 // Isolation standard
    if (isolationScore <= 1.5) return 92.5 // Moyenne (entre 100 et 85)
    return 70 // Très bien isolé
  }

  // Logements construits après 2012 (RT 2012)
  if (isolationScore === 0) return 70 // Standard RT 2012
  if (isolationScore <= 1.5) return 65 // Moyenne (entre 70 et 60)
  return 50 // Très performant (proche BBC)
}

/**
 * Ajuste la consommation selon le nombre d'occupants
 * Plus il y a d'occupants, plus il y a de besoins en chauffage et d'apports internes
 */
function getOccupancyFactor(nombreOccupants: number): number {
  // Facteur de correction basé sur les apports internes
  // 1 personne = référence, plus il y a de personnes, moins on chauffe (apports internes)
  if (nombreOccupants === 1) return 1.1
  if (nombreOccupants === 2) return 1.0
  if (nombreOccupants === 3) return 0.95
  if (nombreOccupants === 4) return 0.92
  return 0.9 // 5+ personnes
}

/**
 * Estime la consommation énergétique annuelle en kWh
 * Prend en compte la zone climatique si le code postal est fourni
 */
export function estimateAnnualConsumption(housing: HousingCharacteristics): number {
  const coefficientBase = getConsumptionCoefficient(
    housing.annee_construction,
    housing.qualite_isolation
  )

  const facteurOccupation = getOccupancyFactor(housing.nombre_occupants)

  // Ajustement selon la zone climatique (si code postal fourni)
  let facteurClimatique = 1.0
  if (housing.code_postal) {
    facteurClimatique = getConsumptionAdjustment(housing.code_postal)
    console.log(`🌡️ Ajustement climatique (${housing.code_postal}): ${(facteurClimatique * 100 - 100).toFixed(0)}%`)
  }

  // Consommation estimée = Surface × Coefficient × Facteur occupation × Facteur climatique
  const consommationEstimee = housing.surface_habitable * coefficientBase * facteurOccupation * facteurClimatique

  return Math.round(consommationEstimee)
}

/**
 * Estime la consommation selon le type d'énergie (en unités spécifiques)
 */
export function estimateConsumptionByEnergyType(
  housing: HousingCharacteristics,
  energyType: string
): { value: number; unit: string } {
  const consommationKwh = estimateAnnualConsumption(housing)

  switch (energyType) {
    case "Fioul":
      // 1 litre de fioul ≈ 10 kWh
      return {
        value: Math.round(consommationKwh / 10),
        unit: "litres/an",
      }

    case "Gaz":
      // Le gaz est déjà en kWh
      return {
        value: Math.round(consommationKwh),
        unit: "kWh/an",
      }

    case "GPL":
      // 1 kg de GPL ≈ 12.8 kWh
      return {
        value: Math.round(consommationKwh / 12.8),
        unit: "kg/an",
      }

    case "Pellets":
      // 1 kg de pellets ≈ 4.8 kWh
      return {
        value: Math.round(consommationKwh / 4.8),
        unit: "kg/an",
      }

    case "Bois":
      // 1 stère ≈ 2000 kWh
      return {
        value: Math.round((consommationKwh / 2000) * 10) / 10, // Arrondi à 1 décimale
        unit: "stères/an",
      }

    case "Electrique":
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      // Pour les PAC existantes, on divise par le COP moyen (~2.5 pour anciennes PAC)
      if (energyType.startsWith("PAC")) {
        return {
          value: Math.round(consommationKwh / 2.5),
          unit: "kWh/an",
        }
      }
      // Électrique direct
      return {
        value: Math.round(consommationKwh),
        unit: "kWh/an",
      }

    default:
      return {
        value: Math.round(consommationKwh),
        unit: "kWh/an",
      }
  }
}

/**
 * Retourne une estimation de la classe DPE (A à G)
 */
export function estimateDPEClass(housing: HousingCharacteristics): string {
  const consommationParM2 = estimateAnnualConsumption(housing) / housing.surface_habitable

  if (consommationParM2 < 50) return "A"
  if (consommationParM2 < 90) return "B"
  if (consommationParM2 < 150) return "C"
  if (consommationParM2 < 230) return "D"
  if (consommationParM2 < 330) return "E"
  if (consommationParM2 < 450) return "F"
  return "G"
}
