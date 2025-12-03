/**
 * Tables de rendement par type de chauffage et âge
 * Les valeurs sont basées sur les études ADEME et les normes européennes
 */

// Rendement des chaudières à gaz selon l'âge (en pourcentage)
export const GAS_BOILER_EFFICIENCY = {
  condensing: {
    "0-5": 0.92,
    "5-10": 0.88,
    "10-15": 0.82,
    "15-20": 0.77,
    "20+": 0.68,
  },
  "non-condensing": {
    "0-5": 0.78,
    "5-10": 0.74,
    "10-15": 0.69,
    "15-20": 0.64,
    "20+": 0.58,
  },
}

// Rendement des chaudières au fioul selon l'âge (en pourcentage)
export const OIL_BOILER_EFFICIENCY = {
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
export const ELECTRIC_EFFICIENCY = 1.0

// Rendement des systèmes à bois/pellets selon l'âge
export const WOOD_PELLET_EFFICIENCY = {
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
export const MAINTENANCE_FACTORS = {
  Bon: 1.0,      // Entretien régulier, pas de pénalité
  Moyen: 0.93,   // Entretien occasionnel, -7% de rendement
  Mauvais: 0.85, // Pas d'entretien, -15% de rendement
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
