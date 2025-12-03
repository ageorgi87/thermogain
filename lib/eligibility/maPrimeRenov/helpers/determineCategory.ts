/**
 * Détermine la catégorie de revenus selon les barèmes ANAH
 */

import { MaPrimeRenovCategory, BAREME_IDF_2024, BAREME_PROVINCE_2024 } from '../maPrimeRenovData'
import { isIleDeFrance } from './isIleDeFrance'

export const determineCategory = (
  revenuFiscalReference: number,
  nombrePersonnes: number,
  codePostal: string
): MaPrimeRenovCategory => {
  const isIDF = isIleDeFrance(codePostal)
  const bareme = isIDF ? BAREME_IDF_2024 : BAREME_PROVINCE_2024

  let seuils: { bleu: number; jaune: number; violet: number; rose: number }

  if (nombrePersonnes <= 5) {
    seuils = bareme[nombrePersonnes]
  } else {
    // Calcul pour foyers de plus de 5 personnes
    const seuilsBase = bareme[5]
    const personnesSupplementaires = nombrePersonnes - 5

    if (isIDF) {
      seuils = {
        bleu: seuilsBase.bleu + personnesSupplementaires * 6961,
        jaune: seuilsBase.jaune + personnesSupplementaires * 8486,
        violet: seuilsBase.violet + personnesSupplementaires * 11995,
        rose: Infinity,
      }
    } else {
      seuils = {
        bleu: seuilsBase.bleu + personnesSupplementaires * 5045,
        jaune: seuilsBase.jaune + personnesSupplementaires * 6462,
        violet: seuilsBase.violet + personnesSupplementaires * 9165,
        rose: Infinity,
      }
    }
  }

  if (revenuFiscalReference <= seuils.bleu) return "bleu"
  if (revenuFiscalReference <= seuils.jaune) return "jaune"
  if (revenuFiscalReference <= seuils.violet) return "violet"
  return "rose"
}
