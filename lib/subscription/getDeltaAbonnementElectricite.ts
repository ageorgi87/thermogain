import { getAbonnementElectriciteAnnuel } from "./getAbonnementElectriciteAnnuel"

/**
 * Calcule la différence d'abonnement électrique entre deux puissances
 * Utilisé pour calculer le surcoût d'abonnement lors de l'installation d'une PAC
 *
 * @param puissanceActuelle - Puissance souscrite actuelle en kVA
 * @param puissancePac - Puissance recommandée pour la PAC en kVA
 * @returns Delta d'abonnement annuel en euros (positif = augmentation, négatif = diminution)
 */
export const getDeltaAbonnementElectricite = (
  puissanceActuelle: number,
  puissancePac: number
): number => {
  const abonnementActuel = getAbonnementElectriciteAnnuel(puissanceActuelle)
  const abonnementPac = getAbonnementElectriciteAnnuel(puissancePac)
  return abonnementPac - abonnementActuel
}
