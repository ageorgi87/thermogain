/**
 * Détermine la puissance souscrite électrique recommandée selon la puissance de la PAC
 *
 * Logique de calcul:
 * - On part de la puissance actuelle du client (qui couvre déjà tous ses besoins existants)
 * - On ajoute la puissance de la PAC (sans marge car coefficient de foisonnement)
 * - Le coefficient de foisonnement suppose que la PAC ne démarre pas toujours au moment
 *   où tous les autres appareils du logement sont en marche simultanément
 * - On arrondit à la tranche EDF supérieure (3, 6, 9, 12, 15, 18 kVA)
 *
 * @param puissancePacKw - Puissance nominale de la PAC en kW
 * @param puissanceActuelleKva - Puissance souscrite actuelle en kVA
 * @returns Puissance recommandée en kVA (6, 9, 12, 15, ou 18)
 */
export const getPuissanceSouscritePacRecommandee = (
  puissancePacKw: number,
  puissanceActuelleKva: number
): number => {
  // Calcul théorique: puissance actuelle + puissance PAC
  const puissanceTheorique = puissanceActuelleKva + puissancePacKw

  // Détermination par tranches (arrondissement à la tranche supérieure)
  let puissanceRecommandee: number

  if (puissanceTheorique <= 6) {
    puissanceRecommandee = 6
  } else if (puissanceTheorique <= 9) {
    puissanceRecommandee = 9
  } else if (puissanceTheorique <= 12) {
    puissanceRecommandee = 12
  } else if (puissanceTheorique <= 15) {
    puissanceRecommandee = 15
  } else {
    puissanceRecommandee = 18
  }

  return puissanceRecommandee
}
