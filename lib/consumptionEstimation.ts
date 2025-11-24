/**
 * Estimation de la consommation énergétique annuelle basée sur les caractéristiques du logement
 * Méthode inspirée du DPE (Diagnostic de Performance Énergétique) et des coefficients de déperdition thermique
 */

interface HousingCharacteristics {
  surface_habitable: number
  annee_construction: number
  isolation_murs: boolean
  isolation_combles: boolean
  isolation_fenetres: boolean
  nombre_occupants: number
}

/**
 * Calcule le coefficient de consommation en kWh/m²/an selon l'année de construction et l'isolation
 */
function getConsumptionCoefficient(
  anneeConstruction: number,
  isolationMurs: boolean,
  isolationCombles: boolean,
  isolationFenetres: boolean
): number {
  // Compter le nombre d'éléments isolés (0 à 3)
  const isolationScore = [isolationMurs, isolationCombles, isolationFenetres].filter(Boolean).length

  // Logements construits avant 1975 (pas de RT)
  if (anneeConstruction < 1975) {
    if (isolationScore === 0) return 200 // Très mal isolé
    if (isolationScore === 1) return 170 // Mal isolé
    if (isolationScore === 2) return 140 // Isolation partielle
    return 110 // Bien isolé après rénovation
  }

  // Logements construits entre 1975 et 2000 (RT 1974-2000)
  if (anneeConstruction < 2000) {
    if (isolationScore === 0) return 150 // Mal isolé
    if (isolationScore === 1) return 130 // Isolation partielle
    if (isolationScore === 2) return 110 // Bien isolé
    return 90 // Très bien isolé
  }

  // Logements construits entre 2000 et 2012 (RT 2000-2005)
  if (anneeConstruction < 2012) {
    if (isolationScore < 2) return 100 // Isolation standard
    if (isolationScore === 2) return 85 // Bien isolé
    return 70 // Très bien isolé
  }

  // Logements construits après 2012 (RT 2012)
  if (isolationScore < 2) return 70 // Standard RT 2012
  if (isolationScore === 2) return 60 // Bien isolé
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
 */
export function estimateAnnualConsumption(housing: HousingCharacteristics): number {
  const coefficientBase = getConsumptionCoefficient(
    housing.annee_construction,
    housing.isolation_murs,
    housing.isolation_combles,
    housing.isolation_fenetres
  )

  const facteurOccupation = getOccupancyFactor(housing.nombre_occupants)

  // Consommation estimée = Surface × Coefficient × Facteur occupation
  const consommationEstimee = housing.surface_habitable * coefficientBase * facteurOccupation

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
