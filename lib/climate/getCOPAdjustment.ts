import { getClimateInfoFromPostalCode } from "./getClimateInfoFromPostalCode"

/**
 * Calcule le coefficient d'ajustement du COP selon la zone climatique
 * Les PAC sont plus efficaces en zones chaudes (températures extérieures plus élevées)
 *
 * @param codePostal - Code postal français
 * @returns Coefficient multiplicateur du COP
 */
export const getCOPAdjustment = (codePostal: string): number => {
  const info = getClimateInfoFromPostalCode(codePostal)
  return info.copAdjustment
}
