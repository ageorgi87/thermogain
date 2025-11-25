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

/**
 * Valide que la puissance de la PAC est adaptée aux besoins
 * Règle générale : 40-80 W/m² selon isolation et zone climatique
 *
 * @param puissancePacKw - Puissance de la PAC en kW
 * @param surfaceHabitable - Surface habitable en m²
 * @param anneeConstruction - Année de construction (fallback si qualiteIsolation non fournie)
 * @param qualiteIsolation - Qualité d'isolation réelle ("Bonne" | "Moyenne" | "Mauvaise")
 * @param codePostal - Code postal pour ajustement climatique (optionnel)
 * @returns { isValid: boolean, message: string, recommendedPower: number }
 */
export function validatePacPower(
  puissancePacKw: number,
  surfaceHabitable: number,
  anneeConstruction: number,
  qualiteIsolation?: string,
  codePostal?: string
): {
  isValid: boolean
  message: string
  recommendedPowerMin: number
  recommendedPowerMax: number
} {
  // 1. Déterminer le coefficient de base selon la qualité d'isolation
  // Pondération : 80% info utilisateur + 20% âge de la maison
  let coefficientWparM2: number

  // Coefficient selon l'année de construction (baseline)
  let coefficientAge: number
  if (anneeConstruction >= 2012) {
    coefficientAge = 50 // RT 2012 et après : bien isolé
  } else if (anneeConstruction >= 2000) {
    coefficientAge = 60 // RT 2000-2005 : isolation correcte
  } else if (anneeConstruction >= 1980) {
    coefficientAge = 70 // Années 1980-2000 : isolation moyenne
  } else {
    coefficientAge = 80 // Avant 1980 : isolation faible
  }

  if (qualiteIsolation) {
    // Coefficient selon la qualité d'isolation déclarée
    let coefficientUtilisateur: number
    switch (qualiteIsolation) {
      case "Bonne":
        coefficientUtilisateur = 45 // Bonne isolation (RT 2012+, ou rénovée BBC)
        break
      case "Moyenne":
        coefficientUtilisateur = 60 // Isolation moyenne (RT 2000-2005)
        break
      case "Mauvaise":
        coefficientUtilisateur = 80 // Mauvaise isolation (avant 1980, non rénovée)
        break
      default:
        coefficientUtilisateur = 60 // Défaut conservateur
    }

    // Pondération : 80% utilisateur + 20% âge
    coefficientWparM2 = coefficientUtilisateur * 0.8 + coefficientAge * 0.2

    console.log(`🏠 Calcul coefficient isolation (pondéré):`)
    console.log(`   - Info utilisateur (${qualiteIsolation}): ${coefficientUtilisateur} W/m² (80%)`)
    console.log(`   - Âge construction (${anneeConstruction}): ${coefficientAge} W/m² (20%)`)
    console.log(`   → Coefficient final: ${coefficientWparM2.toFixed(1)} W/m²`)
  } else {
    // Fallback sur l'année de construction uniquement si qualité non fournie
    coefficientWparM2 = coefficientAge
    console.log(`🏠 Calcul coefficient isolation (âge uniquement):`)
    console.log(`   - Âge construction (${anneeConstruction}): ${coefficientAge} W/m²`)
  }

  // 2. Ajustement selon la zone climatique
  let facteurClimatique = 1.0
  let zoneClimatiqueInfo = ""

  if (codePostal) {
    const climateInfo = getClimateInfoFromPostalCode(codePostal)
    // Plus il fait froid, plus la puissance doit être élevée
    // On utilise les DJU pour ajuster : plus de DJU = plus de besoins
    const djuReference = 2200 // H2a (zone tempérée de référence)
    facteurClimatique = climateInfo.dju / djuReference

    zoneClimatiqueInfo = `${climateInfo.zone} (${climateInfo.description})`

    console.log(`🌡️ Ajustement climatique pour dimensionnement PAC:`)
    console.log(`   - Zone: ${climateInfo.zone}`)
    console.log(`   - DJU: ${climateInfo.dju} (référence: ${djuReference})`)
    console.log(`   - Facteur: ${(facteurClimatique * 100).toFixed(0)}%`)
  }

  // 3. Calculer la puissance recommandée avec ajustement climatique
  const coefficientAjuste = coefficientWparM2 * facteurClimatique
  const puissanceRecommandeeMin = (surfaceHabitable * coefficientAjuste * 0.9) / 1000 // kW
  const puissanceRecommandeeMax = (surfaceHabitable * coefficientAjuste * 1.2) / 1000 // kW

  // 4. Vérifier si la puissance est dans la fourchette
  const isValid = puissancePacKw >= puissanceRecommandeeMin && puissancePacKw <= puissanceRecommandeeMax

  // 5. Générer le message détaillé
  let message = ""
  const isolationText = qualiteIsolation
    ? `isolation ${qualiteIsolation.toLowerCase()}`
    : `construction ${anneeConstruction}`

  const climatText = codePostal
    ? ` en zone ${zoneClimatiqueInfo}`
    : ""

  if (!isValid) {
    if (puissancePacKw < puissanceRecommandeeMin) {
      message = `⚠️ Puissance potentiellement insuffisante pour ${surfaceHabitable} m² avec ${isolationText}${climatText}. Recommandé : ${puissanceRecommandeeMin.toFixed(1)}-${puissanceRecommandeeMax.toFixed(1)} kW`
    } else {
      message = `⚠️ Puissance potentiellement surdimensionnée pour ${surfaceHabitable} m² avec ${isolationText}${climatText}. Recommandé : ${puissanceRecommandeeMin.toFixed(1)}-${puissanceRecommandeeMax.toFixed(1)} kW`
    }
  } else {
    message = `✅ Puissance adaptée pour ${surfaceHabitable} m² avec ${isolationText}${climatText} (recommandé : ${puissanceRecommandeeMin.toFixed(1)}-${puissanceRecommandeeMax.toFixed(1)} kW)`
  }

  return {
    isValid,
    message,
    recommendedPowerMin: Math.round(puissanceRecommandeeMin * 10) / 10,
    recommendedPowerMax: Math.round(puissanceRecommandeeMax * 10) / 10,
  }
}
