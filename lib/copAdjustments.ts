/**
 * Ajustements du COP (Coefficient de Performance) d'une PAC
 * Basé sur les données techniques et retours d'expérience terrain
 *
 * Le COP fabricant est mesuré en conditions optimales (7°C extérieur / 35°C eau chauffage)
 * En réalité, le COP varie selon :
 * - La température de départ de l'eau (impacte directement l'efficacité)
 * - Le type d'émetteurs (détermine la température de départ nécessaire)
 * - La zone climatique (température extérieure moyenne)
 */

import { getCOPAdjustment as getClimateAdjustment } from "./climateZones"

/**
 * Calcule le coefficient d'ajustement selon la température de départ
 * Plus la température est élevée, plus le COP diminue
 *
 * Référence : Courbes de performance des PAC air/eau
 * - 35°C (plancher chauffant) : référence (1.0)
 * - 45°C (radiateurs BT) : -15%
 * - 55°C (radiateurs MT) : -25%
 * - 65°C (radiateurs HT) : -35%
 */
export function getTemperatureAdjustment(temperatureDepart: number): number {
  if (temperatureDepart <= 35) return 1.0      // Conditions optimales
  if (temperatureDepart <= 40) return 0.95     // Plancher + radiateurs BT
  if (temperatureDepart <= 45) return 0.85     // Radiateurs basse température
  if (temperatureDepart <= 50) return 0.80     // Radiateurs moyenne température (début)
  if (temperatureDepart <= 55) return 0.75     // Radiateurs moyenne température
  if (temperatureDepart <= 60) return 0.70     // Radiateurs haute température (début)
  return 0.65                                  // Radiateurs haute température
}

/**
 * Calcule le coefficient d'ajustement selon le type d'émetteurs
 * Certains émetteurs nécessitent des températures plus élevées
 *
 * Référence : DTU 65.14 et guides ADEME
 */
export function getEmitterAdjustment(typeEmetteurs: string): number {
  switch (typeEmetteurs) {
    case "Plancher chauffant":
      // Optimal : température de départ 35°C
      return 1.0

    case "Radiateurs basse température":
      // Bon : température de départ 45°C
      return 0.90

    case "Ventilo-convecteurs":
      // Très bon : excellent échange thermique
      return 0.95

    case "Radiateurs haute température":
      // Difficile : température de départ 60-65°C
      // COP fortement dégradé
      return 0.70

    default:
      // Valeur conservatrice par défaut
      return 0.85
  }
}

/**
 * Calcule le COP réel ajusté selon tous les facteurs
 *
 * @param copFabricant - COP nominal du fabricant (conditions 7°C/-35°C)
 * @param temperatureDepart - Température de départ eau chauffage (°C)
 * @param typeEmetteurs - Type d'émetteurs de chaleur
 * @param codePostal - Code postal pour ajustement climatique (optionnel)
 * @returns COP ajusté réel
 */
export function calculateAdjustedCOP(
  copFabricant: number,
  temperatureDepart: number,
  typeEmetteurs: string,
  codePostal?: string
): number {
  // Facteur température
  const facteurTemperature = getTemperatureAdjustment(temperatureDepart)

  // Facteur émetteurs
  const facteurEmetteurs = getEmitterAdjustment(typeEmetteurs)

  // Facteur climatique (si code postal fourni)
  let facteurClimatique = 1.0
  if (codePostal) {
    facteurClimatique = getClimateAdjustment(codePostal)
  }

  // COP ajusté = COP fabricant × tous les facteurs
  const copAjuste = copFabricant * facteurTemperature * facteurEmetteurs * facteurClimatique

  // Log pour debug
  console.log(`🔧 Ajustement COP:`)
  console.log(`   - COP fabricant: ${copFabricant.toFixed(2)}`)
  console.log(`   - Température ${temperatureDepart}°C: ${(facteurTemperature * 100).toFixed(0)}%`)
  console.log(`   - Émetteurs "${typeEmetteurs}": ${(facteurEmetteurs * 100).toFixed(0)}%`)
  if (codePostal) {
    console.log(`   - Climat (${codePostal}): ${(facteurClimatique * 100).toFixed(0)}%`)
  }
  console.log(`   → COP ajusté: ${copAjuste.toFixed(2)}`)

  // Arrondir à 2 décimales
  return Math.round(copAjuste * 100) / 100
}

/**
 * Valide que la puissance de la PAC est adaptée aux besoins
 * Règle générale : 50-80 W/m² selon isolation
 *
 * @param puissancePacKw - Puissance de la PAC en kW
 * @param surfaceHabitable - Surface habitable en m²
 * @param anneeConstruction - Année de construction (pour estimer isolation)
 * @returns { isValid: boolean, message: string, recommendedPower: number }
 */
export function validatePacPower(
  puissancePacKw: number,
  surfaceHabitable: number,
  anneeConstruction: number
): {
  isValid: boolean
  message: string
  recommendedPowerMin: number
  recommendedPowerMax: number
} {
  // Déterminer le coefficient selon l'époque de construction
  let coefficientWparM2: number

  if (anneeConstruction >= 2012) {
    // RT 2012 et après : bien isolé
    coefficientWparM2 = 50 // 50 W/m²
  } else if (anneeConstruction >= 2000) {
    // RT 2000-2005 : isolation correcte
    coefficientWparM2 = 60 // 60 W/m²
  } else if (anneeConstruction >= 1980) {
    // Années 1980-2000 : isolation moyenne
    coefficientWparM2 = 70 // 70 W/m²
  } else {
    // Avant 1980 : isolation faible
    coefficientWparM2 = 80 // 80 W/m²
  }

  // Calculer la puissance recommandée (avec marge de 20%)
  const puissanceRecommandeeMin = (surfaceHabitable * coefficientWparM2 * 0.9) / 1000 // kW
  const puissanceRecommandeeMax = (surfaceHabitable * coefficientWparM2 * 1.2) / 1000 // kW

  // Vérifier si la puissance est dans la fourchette
  const isValid = puissancePacKw >= puissanceRecommandeeMin && puissancePacKw <= puissanceRecommandeeMax

  let message = ""
  if (!isValid) {
    if (puissancePacKw < puissanceRecommandeeMin) {
      message = `⚠️ Puissance potentiellement insuffisante. Recommandé : ${puissanceRecommandeeMin.toFixed(1)}-${puissanceRecommandeeMax.toFixed(1)} kW`
    } else {
      message = `⚠️ Puissance potentiellement surdimensionnée. Recommandé : ${puissanceRecommandeeMin.toFixed(1)}-${puissanceRecommandeeMax.toFixed(1)} kW`
    }
  } else {
    message = `✅ Puissance adaptée (${puissanceRecommandeeMin.toFixed(1)}-${puissanceRecommandeeMax.toFixed(1)} kW)`
  }

  return {
    isValid,
    message,
    recommendedPowerMin: Math.round(puissanceRecommandeeMin * 10) / 10,
    recommendedPowerMax: Math.round(puissanceRecommandeeMax * 10) / 10,
  }
}
