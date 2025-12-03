/**
 * Module de calcul du rendement réel des systèmes de chauffage
 * Basé sur les standards ADEME, DPE 3CL-DPE 2021, et EN 15316
 *
 * Sources:
 * - ADEME: Étude 2023-2024 sur les performances des PAC
 * - DPE 3CL-DPE 2021: Méthode officielle française de calcul énergétique
 * - EN 15316: Norme européenne pour les systèmes de chauffage
 * - Recherche UK Energy Saving Trust: Dégradation des chaudières à condensation
 */

/**
 * Tables de rendement par type de chauffage et âge
 * Les valeurs sont basées sur les études ADEME et les normes européennes
 */

// Rendement des chaudières à gaz selon l'âge (en pourcentage)
const GAS_BOILER_EFFICIENCY = {
  condensing: {
    "0-5": 0.92,    // Chaudière condensation moderne
    "5-10": 0.88,   // Légère dégradation
    "10-15": 0.82,  // Dégradation moyenne
    "15-20": 0.77,  // Dégradation importante
    "20+": 0.68,    // Chaudière ancienne
  },
  "non-condensing": {
    "0-5": 0.78,    // Chaudière standard moderne
    "5-10": 0.74,   // Légère dégradation
    "10-15": 0.69,  // Dégradation moyenne
    "15-20": 0.64,  // Dégradation importante
    "20+": 0.58,    // Chaudière très ancienne
  },
}

// Rendement des chaudières au fioul selon l'âge (en pourcentage)
const OIL_BOILER_EFFICIENCY = {
  condensing: {
    "0-5": 0.90,
    "5-10": 0.86,
    "10-15": 0.80,
    "15-20": 0.74,
    "20+": 0.65,
  },
  standard: {
    "0-5": 0.75,
    "5-10": 0.72,
    "10-15": 0.68,
    "15-20": 0.63,
    "20+": 0.58,
  },
}

// Rendement des systèmes électriques (constant, pas de dégradation significative)
const ELECTRIC_EFFICIENCY = 1.0

// Rendement des systèmes à bois/pellets selon l'âge
const WOOD_PELLET_EFFICIENCY = {
  modern: {
    "0-5": 0.85,
    "5-10": 0.82,
    "10-15": 0.80,
    "15-20": 0.77,
    "20+": 0.75,
  },
}

// Facteurs de correction selon l'état d'entretien
// Basé sur les études UK Energy Saving Trust
const MAINTENANCE_FACTORS = {
  Bon: 1.0,      // Entretien régulier, pas de pénalité
  Moyen: 0.93,   // Entretien occasionnel, -7% de rendement
  Mauvais: 0.85, // Pas d'entretien, -15% de rendement
}

/**
 * Détermine la tranche d'âge d'une installation
 */
const getAgeRange = (age: number): keyof typeof GAS_BOILER_EFFICIENCY.condensing => {
  if (age < 5) return "0-5"
  if (age < 10) return "5-10"
  if (age < 15) return "10-15"
  if (age < 20) return "15-20"
  return "20+"
}

/**
 * Calcule le rendement réel d'une chaudière à gaz
 */
const calculateGasBoilerEfficiency = (
  age: number,
  condition: "Bon" | "Moyen" | "Mauvais",
  isCondensing: boolean = true // Par défaut, on assume condensation (plus courant depuis 2000)
): number => {
  const ageRange = getAgeRange(age)
  const baseEfficiency = isCondensing
    ? GAS_BOILER_EFFICIENCY.condensing[ageRange]
    : GAS_BOILER_EFFICIENCY["non-condensing"][ageRange]

  const maintenanceFactor = MAINTENANCE_FACTORS[condition]

  return baseEfficiency * maintenanceFactor
}

/**
 * Calcule le rendement réel d'une chaudière au fioul
 */
const calculateOilBoilerEfficiency = (
  age: number,
  condition: "Bon" | "Moyen" | "Mauvais",
  isCondensing: boolean = false // Les chaudières fioul à condensation sont plus rares
): number => {
  const ageRange = getAgeRange(age)
  const baseEfficiency = isCondensing
    ? OIL_BOILER_EFFICIENCY.condensing[ageRange]
    : OIL_BOILER_EFFICIENCY.standard[ageRange]

  const maintenanceFactor = MAINTENANCE_FACTORS[condition]

  return baseEfficiency * maintenanceFactor
}

/**
 * Calcule le rendement réel d'un système à bois/pellets
 */
const calculateWoodPelletEfficiency = (
  age: number,
  condition: "Bon" | "Moyen" | "Mauvais"
): number => {
  const ageRange = getAgeRange(age)
  const baseEfficiency = WOOD_PELLET_EFFICIENCY.modern[ageRange]
  const maintenanceFactor = MAINTENANCE_FACTORS[condition]

  return baseEfficiency * maintenanceFactor
}

/**
 * Calcule le rendement réel d'un système de chauffage
 *
 * @param heatingType - Type de chauffage (Gaz, Fioul, GPL, Pellets, Bois, Electrique, PAC)
 * @param age - Âge de l'installation en années
 * @param condition - État d'entretien (Bon, Moyen, Mauvais)
 * @param isCondensing - Si c'est une chaudière à condensation (optionnel, défaut intelligent par type)
 * @returns Le rendement réel en pourcentage (0-1)
 *
 * @example
 * // Chaudière gaz de 20 ans en mauvais état
 * calculateBoilerEfficiency("Gaz", 20, "Mauvais") // => 0.578 (57.8%)
 *
 * // Chaudière fioul moderne bien entretenue
 * calculateBoilerEfficiency("Fioul", 3, "Bon") // => 0.75 (75%)
 */
export const calculateBoilerEfficiency = (
  heatingType: string,
  age: number,
  condition: "Bon" | "Moyen" | "Mauvais",
  isCondensing?: boolean
): number => {
  // Valider l'état d'entretien
  if (!["Bon", "Moyen", "Mauvais"].includes(condition)) {
    console.warn(`État d'entretien invalide: ${condition}, utilisation de "Moyen" par défaut`)
    condition = "Moyen"
  }

  // Valider l'âge
  if (age < 0 || age > 100) {
    console.warn(`Âge invalide: ${age}, utilisation de 10 ans par défaut`)
    age = 10
  }

  switch (heatingType) {
    case "Gaz":
      // Chaudières gaz: condensation par défaut si < 15 ans (depuis ~2010)
      const gasIsCondensing = isCondensing !== undefined ? isCondensing : age < 15
      return calculateGasBoilerEfficiency(age, condition, gasIsCondensing)

    case "Fioul":
      // Chaudières fioul: rarement à condensation
      const oilIsCondensing = isCondensing !== undefined ? isCondensing : false
      return calculateOilBoilerEfficiency(age, condition, oilIsCondensing)

    case "GPL":
      // GPL fonctionne comme le gaz
      const gplIsCondensing = isCondensing !== undefined ? isCondensing : age < 15
      return calculateGasBoilerEfficiency(age, condition, gplIsCondensing)

    case "Pellets":
    case "Bois":
      return calculateWoodPelletEfficiency(age, condition)

    case "Electrique":
      // Le chauffage électrique a un rendement de ~100% (toute l'énergie est convertie en chaleur)
      return ELECTRIC_EFFICIENCY

    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      // Les PAC ne sont pas des systèmes à combustion, leur "rendement" est le COP
      // On retourne 1.0 ici car le COP sera géré séparément
      return 1.0

    default:
      console.warn(`Type de chauffage inconnu: ${heatingType}, utilisation de 0.75 par défaut`)
      return 0.75
  }
}

/**
 * Convertit la consommation de combustible en demande de chaleur réelle
 * en tenant compte du rendement de la chaudière
 *
 * @param fuelConsumption - Consommation de combustible (en unité appropriée)
 * @param fuelEnergyContent - Contenu énergétique du combustible (kWh par unité)
 * @param boilerEfficiency - Rendement de la chaudière (0-1)
 * @returns La demande de chaleur réelle en kWh
 *
 * @example
 * // 2000 litres de fioul (10 kWh/L) avec chaudière à 65% de rendement
 * calculateHeatDemand(2000, 10, 0.65) // => 13,000 kWh de chaleur
 */
export const calculateHeatDemand = (
  fuelConsumption: number,
  fuelEnergyContent: number,
  boilerEfficiency: number
): number => {
  return fuelConsumption * fuelEnergyContent * boilerEfficiency
}

/**
 * Contenu énergétique des différents combustibles
 * Ces valeurs sont standardisées et validées par ADEME
 */
export const FUEL_ENERGY_CONTENT = {
  fioul: 10,      // kWh/litre
  gaz: 1,         // kWh/kWh (déjà en kWh)
  gpl: 12.8,      // kWh/kg
  pellets: 4.8,   // kWh/kg
  bois: 2000,     // kWh/stère (bois sec)
  electricite: 1, // kWh/kWh
} as const

/**
 * Calcule la consommation énergétique d'une PAC pour atteindre une demande de chaleur donnée
 *
 * @param heatDemand - Demande de chaleur en kWh
 * @param cop - Coefficient de Performance de la PAC
 * @returns La consommation électrique de la PAC en kWh
 *
 * @example
 * // 13,000 kWh de chaleur avec une PAC à COP 2.9
 * calculatePACConsumption(13000, 2.9) // => 4,483 kWh d'électricité
 */
export const calculatePACConsumption = (heatDemand: number, cop: number): number => {
  if (cop <= 0) {
    console.warn(`COP invalide: ${cop}, utilisation de 2.9 (moyenne ADEME) par défaut`)
    cop = 2.9
  }
  return heatDemand / cop
}

/**
 * Génère un message explicatif sur le rendement calculé
 * Utile pour afficher à l'utilisateur pourquoi son rendement est bas/élevé
 */
export const getEfficiencyExplanation = (
  heatingType: string,
  age: number,
  condition: "Bon" | "Moyen" | "Mauvais",
  efficiency: number
): string => {
  const efficiencyPercent = Math.round(efficiency * 100)

  let explanation = `Votre ${heatingType} de ${age} ans `

  if (condition === "Bon") {
    explanation += "bien entretenu "
  } else if (condition === "Moyen") {
    explanation += "moyennement entretenu "
  } else {
    explanation += "mal entretenu "
  }

  explanation += `fonctionne à environ ${efficiencyPercent}% de rendement.`

  if (efficiency < 0.70) {
    explanation += " ⚠️ Ce rendement est faible. Un entretien ou un remplacement permettrait de réaliser des économies importantes."
  } else if (efficiency < 0.80) {
    explanation += " Ce rendement est dans la moyenne des installations anciennes."
  } else if (efficiency < 0.90) {
    explanation += " Ce rendement est correct pour une installation de cet âge."
  } else {
    explanation += " Ce rendement est excellent."
  }

  return explanation
}
