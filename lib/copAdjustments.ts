/**
 * Ajustements du COP (Coefficient de Performance) d'une PAC
 * Basé sur les données techniques et retours d'expérience terrain
 *
 * Le COP fabricant est mesuré en conditions optimales (7°C extérieur / 35°C eau chauffage)
 * En réalité, le COP varie selon :
 * - La température de départ de l'eau (impacte directement l'efficacité) - UNIQUEMENT pour PAC hydrauliques
 * - Le type d'émetteurs (détermine la température de départ nécessaire) - UNIQUEMENT pour PAC hydrauliques
 * - La zone climatique (température extérieure moyenne) - TOUS types de PAC
 *
 * IMPORTANT: Les PAC Air/Air n'ont pas de circuit d'eau, donc les ajustements température/émetteurs
 * ne s'appliquent PAS à ce type. Seul l'ajustement climatique est pertinent.
 */

import { getCOPAdjustment as getClimateAdjustment, getClimateInfoFromPostalCode } from "./climateZones"

/**
 * Calcule le coefficient d'ajustement selon la température de départ
 * Plus la température est élevée, plus le COP diminue
 *
 * ⚠️ Ne s'applique QUE aux PAC avec circuit d'eau (Air/Eau, Eau/Eau)
 * Les PAC Air/Air n'ont pas de circuit d'eau donc ce facteur = 1.0
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
 * ⚠️ Ne s'applique QUE aux PAC avec circuit d'eau (Air/Eau, Eau/Eau)
 * Les PAC Air/Air diffusent directement l'air donc ce facteur = 1.0
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
 * @param temperatureDepart - Température de départ eau chauffage (°C) - ignoré pour Air/Air
 * @param typeEmetteurs - Type d'émetteurs de chaleur - ignoré pour Air/Air
 * @param codePostal - Code postal pour ajustement climatique (optionnel)
 * @param typePac - Type de PAC (Air/Eau, Eau/Eau, Air/Air) - détermine les ajustements applicables
 * @returns COP ajusté réel
 */
export function calculateAdjustedCOP(
  copFabricant: number,
  temperatureDepart: number,
  typeEmetteurs: string,
  codePostal?: string,
  typePac?: string
): number {
  // Les PAC Air/Air n'ont pas de circuit d'eau
  // Elles ne nécessitent pas d'ajustements température/émetteurs
  const isAirToAir = typePac === "Air/Air"

  // Facteur température (uniquement pour PAC hydrauliques)
  const facteurTemperature = isAirToAir ? 1.0 : getTemperatureAdjustment(temperatureDepart)

  // Facteur émetteurs (uniquement pour PAC hydrauliques)
  const facteurEmetteurs = isAirToAir ? 1.0 : getEmitterAdjustment(typeEmetteurs)

  // Facteur climatique (s'applique à TOUS les types de PAC)
  let facteurClimatique = 1.0
  if (codePostal) {
    facteurClimatique = getClimateAdjustment(codePostal)
  }

  // COP ajusté = COP fabricant × tous les facteurs applicables
  const copAjuste = copFabricant * facteurTemperature * facteurEmetteurs * facteurClimatique

  // Log pour debug
  console.log(`🔧 Ajustement COP (${typePac || "non spécifié"}):`)
  console.log(`   - COP fabricant: ${copFabricant.toFixed(2)}`)

  if (isAirToAir) {
    console.log(`   ℹ️  PAC Air/Air : ajustements température/émetteurs non applicables (pas de circuit d'eau)`)
  } else {
    console.log(`   - Température ${temperatureDepart}°C: ${(facteurTemperature * 100).toFixed(0)}%`)
    console.log(`   - Émetteurs "${typeEmetteurs}": ${(facteurEmetteurs * 100).toFixed(0)}%`)
  }

  if (codePostal) {
    console.log(`   - Climat (${codePostal}): ${(facteurClimatique * 100).toFixed(0)}%`)
  }
  console.log(`   → COP ajusté: ${copAjuste.toFixed(2)}`)

  // Arrondir à 2 décimales
  return Math.round(copAjuste * 100) / 100
}
