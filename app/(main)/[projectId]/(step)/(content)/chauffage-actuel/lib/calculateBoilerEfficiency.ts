import { ELECTRIC_EFFICIENCY } from "./heatingEfficiencyData"
import { calculateGasBoilerEfficiency } from "./helpers/calculateGasBoilerEfficiency"
import { calculateOilBoilerEfficiency } from "./helpers/calculateOilBoilerEfficiency"
import { calculateWoodPelletEfficiency } from "./helpers/calculateWoodPelletEfficiency"

/**
 * Calcule le rendement réel d'un système de chauffage
 *
 * @param heatingType - Type de chauffage (Gaz, Fioul, GPL, Pellets, Bois, Electrique, PAC)
 * @param age - Âge de l'installation en années
 * @param condition - État d'entretien (Bon, Moyen, Mauvais)
 * @param isCondensing - Si c'est une chaudière à condensation (optionnel, défaut intelligent par type)
 * @returns Le rendement réel en pourcentage (0-1)
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
