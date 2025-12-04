import { ABONNEMENT_ELECTRICITE_ANNUEL } from "@/lib/subscriptionData"

/**
 * Récupère le coût d'abonnement électrique annuel selon la puissance souscrite
 * @param puissanceKva - Puissance souscrite en kVA (3, 6, 9, 12, 15, 18)
 * @returns Coût annuel de l'abonnement en euros TTC
 */
export const getAbonnementElectriciteAnnuel = (puissanceKva: number): number => {
  const tarif =
    ABONNEMENT_ELECTRICITE_ANNUEL[
      puissanceKva as keyof typeof ABONNEMENT_ELECTRICITE_ANNUEL
    ]
  if (!tarif) {
    console.warn(
      `Puissance ${puissanceKva} kVA non reconnue, utilisation 6 kVA par défaut`
    )
    return ABONNEMENT_ELECTRICITE_ANNUEL[6]
  }
  return tarif
}
