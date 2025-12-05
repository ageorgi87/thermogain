import { ELECTRICITY_SUBSCRIPTION_ANNUAL } from "@/config/constants"

/**
 * Récupère le coût d'abonnement électrique annuel selon la puissance souscrite
 * @param puissanceKva - Puissance souscrite en kVA (3, 6, 9, 12, 15, 18)
 * @returns Coût annuel de l'abonnement en euros TTC
 */
export const getAbonnementElectriciteAnnuel = (puissanceKva: number): number => {
  const tarif =
    ELECTRICITY_SUBSCRIPTION_ANNUAL[
      puissanceKva as keyof typeof ELECTRICITY_SUBSCRIPTION_ANNUAL
    ]
  if (!tarif) {
    console.warn(
      `Puissance ${puissanceKva} kVA non reconnue, utilisation 6 kVA par défaut`
    )
    return ELECTRICITY_SUBSCRIPTION_ANNUAL[6]
  }
  return tarif
}
