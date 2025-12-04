import { getClimateInfoFromPostalCode } from "@/app/(main)/[projectId]/lib/getClimateInfoFromPostalCode"

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
const getTemperatureAdjustment = (temperatureDepart: number): number => {
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
const getEmitterAdjustment = (typeEmetteurs: string): number => {
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
 * Calcule le coefficient d'ajustement du COP selon la zone climatique
 * Les PAC sont plus efficaces en zones chaudes (températures extérieures plus élevées)
 *
 * @param codePostal - Code postal français
 * @returns Coefficient multiplicateur du COP
 */
const getClimateAdjustment = (codePostal: string): number => {
  const info = getClimateInfoFromPostalCode(codePostal)
  return info.copAdjustment
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
export const calculateAdjustedCOP = (
  copFabricant: number,
  temperatureDepart: number,
  typeEmetteurs: string,
  codePostal?: string,
  typePac?: string
): number => {
  // Les PAC Air/Air n'ont pas de circuit d'eau
  // Elles ne nécessitent pas d'ajustements température/émetteurs
  const isAirToAir = typePac === "Air/Air";

  // Facteur température (uniquement pour PAC hydrauliques)
  const facteurTemperature = isAirToAir
    ? 1.0
    : getTemperatureAdjustment(temperatureDepart);

  // Facteur émetteurs (uniquement pour PAC hydrauliques)
  const facteurEmetteurs = isAirToAir
    ? 1.0
    : getEmitterAdjustment(typeEmetteurs);

  // Facteur climatique (s'applique à TOUS les types de PAC)
  let facteurClimatique = 1.0;
  if (codePostal) {
    facteurClimatique = getClimateAdjustment(codePostal);
  }

  // COP ajusté = COP fabricant × tous les facteurs applicables
  const copAjuste =
    copFabricant * facteurTemperature * facteurEmetteurs * facteurClimatique;

  // Arrondir à 2 décimales
  return Math.round(copAjuste * 100) / 100;
};
