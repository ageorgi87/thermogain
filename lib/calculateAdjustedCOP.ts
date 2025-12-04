import { getTemperatureAdjustment } from "@/lib/getTemperatureAdjustment";
import { getEmitterAdjustment } from "@/lib/getEmitterAdjustment";
import { getCOPAdjustment as getClimateAdjustment } from "@/lib/getCOPAdjustment";

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
