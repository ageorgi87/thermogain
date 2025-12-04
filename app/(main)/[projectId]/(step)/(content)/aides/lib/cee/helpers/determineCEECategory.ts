/**
 * Détermine la catégorie CEE (précarité énergétique)
 */

import {
  CEECategory,
  SEUILS_PRECARITE_IDF_2024,
  SEUILS_PRECARITE_PROVINCE_2024,
} from "../ceeData";
import { isIleDeFrance } from "@/app/(main)/[projectId]/lib/isIleDeFrance";

export const determineCEECategory = (
  revenuFiscalReference: number,
  nombrePersonnes: number,
  codePostal: string
): CEECategory => {
  const isIDF = isIleDeFrance(codePostal);
  const seuils = isIDF
    ? SEUILS_PRECARITE_IDF_2024
    : SEUILS_PRECARITE_PROVINCE_2024;

  let seuilsApplicables: { precaire: number; modeste: number };

  if (nombrePersonnes <= 5) {
    seuilsApplicables = seuils[nombrePersonnes];
  } else {
    // Calcul pour foyers de plus de 5 personnes
    const seuilsBase = seuils[5];
    const personnesSupplementaires = nombrePersonnes - 5;

    if (isIDF) {
      seuilsApplicables = {
        precaire: seuilsBase.precaire + personnesSupplementaires * 6961,
        modeste: seuilsBase.modeste + personnesSupplementaires * 8486,
      };
    } else {
      seuilsApplicables = {
        precaire: seuilsBase.precaire + personnesSupplementaires * 5045,
        modeste: seuilsBase.modeste + personnesSupplementaires * 6462,
      };
    }
  }

  if (revenuFiscalReference <= seuilsApplicables.precaire) return "precaire";
  if (revenuFiscalReference <= seuilsApplicables.modeste) return "modeste";
  return "classique";
};
