import { getClimateInfoFromPostalCode } from "@/app/(main)/[projectId]/lib/getClimateData/getClimateInfoFromPostalCode";
import { roundToDecimals } from "@/lib/utils/roundToDecimals";
import { PacType } from "@/types/pacType";
import { EmitterType } from "@/types/emitterType";
import { getTemperatureFromEmitterType } from "@/app/(main)/[projectId]/(step)/(content)/projet-pac/lib/getTemperatureFromEmitterType";

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
  if (temperatureDepart <= 35) return 1.0; // Conditions optimales
  if (temperatureDepart <= 40) return 0.95; // Plancher + radiateurs BT
  if (temperatureDepart <= 45) return 0.85; // Radiateurs basse température
  if (temperatureDepart <= 50) return 0.8; // Radiateurs moyenne température (début)
  if (temperatureDepart <= 55) return 0.75; // Radiateurs moyenne température
  if (temperatureDepart <= 60) return 0.7; // Radiateurs haute température (début)
  return 0.65; // Radiateurs haute température
};


/**
 * Calcule le coefficient d'ajustement du COP selon la zone climatique
 * Les PAC sont plus efficaces en zones chaudes (températures extérieures plus élevées)
 *
 * @param codePostal - Code postal français
 * @returns Coefficient multiplicateur du COP
 */
const getClimateAdjustment = (codePostal: string): number => {
  const info = getClimateInfoFromPostalCode(codePostal);
  return info.copAdjustment;
};

/**
 * Calcule le COP réel ajusté selon tous les facteurs
 *
 * Basé sur recherche ADEME (décembre 2024) :
 * - La température de l'eau impacte directement le COP
 * - Le type d'émetteur détermine cette température
 * - Pas de double pénalité (température + émetteur)
 *
 * @param copFabricant - COP nominal du fabricant (conditions 7°C/-35°C)
 * @param typeEmetteurs - Type d'émetteurs de chaleur (détermine automatiquement la température)
 * @param codePostal - Code postal pour ajustement climatique (optionnel)
 * @param typePac - Type de PAC (Air/Eau, Eau/Eau, Air/Air) - détermine les ajustements applicables
 * @returns COP ajusté réel
 */
export const calculateAdjustedCOP = (
  copFabricant: number,
  typeEmetteurs: EmitterType,
  codePostal?: string,
  typePac?: string
): number => {
  // Les PAC Air/Air n'ont pas de circuit d'eau
  // Elles ne nécessitent pas d'ajustements température/émetteurs
  const isAirToAir = typePac === PacType.AIR_AIR;

  // Facteur température (uniquement pour PAC hydrauliques)
  // La température est automatiquement déduite du type d'émetteur
  // C'est le SEUL facteur lié aux émetteurs (pas de double pénalité)
  const facteurTemperature = isAirToAir
    ? 1.0
    : getTemperatureAdjustment(getTemperatureFromEmitterType(typeEmetteurs));

  // Facteur climatique (s'applique à TOUS les types de PAC)
  let facteurClimatique = 1.0;
  if (codePostal) {
    facteurClimatique = getClimateAdjustment(codePostal);
  }

  // COP ajusté = COP nominal × température × climat
  // Note : Pas de facteur émetteur séparé pour éviter la double pénalité
  const copAjuste = copFabricant * facteurTemperature * facteurClimatique;

  // Arrondir à 2 décimales
  return roundToDecimals(copAjuste, 2);
};
