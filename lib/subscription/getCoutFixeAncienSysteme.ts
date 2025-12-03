import { getAbonnementElectriciteAnnuel } from "./getAbonnementElectriciteAnnuel"
import { getEntretienAnnuelMoyen } from "./getEntretienAnnuelMoyen"

/**
 * Calcule le coût total fixe annuel (abonnements + entretien) pour le système actuel
 *
 * @param typeChauffage - Type de système de chauffage actuel
 * @param puissanceElecActuelle - Puissance souscrite électrique actuelle en kVA
 * @param abonnementGaz - Coût abonnement gaz si applicable (0 sinon)
 * @returns Coût total annuel des frais fixes (€/an)
 */
export const getCoutFixeAncienSysteme = (
  typeChauffage: string,
  puissanceElecActuelle: number,
  abonnementGaz: number = 0
): {
  abonnementElec: number
  abonnementGaz: number
  entretien: number
  total: number
} => {
  const abonnementElec = getAbonnementElectriciteAnnuel(puissanceElecActuelle)
  const entretien = getEntretienAnnuelMoyen(typeChauffage)

  return {
    abonnementElec,
    abonnementGaz,
    entretien,
    total: abonnementElec + abonnementGaz + entretien,
  }
}
