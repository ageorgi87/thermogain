import { getAbonnementElectriciteAnnuel } from "@/lib/getAbonnementElectriciteAnnuel"
import { ENTRETIEN_ANNUEL_MOYEN } from "@/lib/subscriptionData"

/**
 * Récupère le coût d'entretien annuel moyen selon le type de chauffage
 * @param typeChauffage - Type de système de chauffage
 * @returns Coût annuel d'entretien en euros
 */
const getEntretienAnnuelMoyen = (typeChauffage: string): number => {
  const cout = ENTRETIEN_ANNUEL_MOYEN[typeChauffage]
  if (cout === undefined) {
    console.warn(
      `Type de chauffage "${typeChauffage}" non reconnu, utilisation 100€ par défaut`
    )
    return 100
  }
  return cout
}

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
