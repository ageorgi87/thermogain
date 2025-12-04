import { getAbonnementElectriciteAnnuel } from "@/app/(main)/[projectId]/lib/getAbonnementElectriciteAnnuel"

/**
 * Calcule le coût total fixe annuel (abonnement + entretien) pour la PAC
 *
 * @param puissancePacKva - Puissance souscrite électrique pour la PAC en kVA
 * @param entretienPac - Coût d'entretien annuel de la PAC (défaut 120€)
 * @returns Coût total annuel des frais fixes (€/an)
 */
export const getCoutFixePac = (
  puissancePacKva: number,
  entretienPac: number = 120
): {
  abonnementElec: number
  entretien: number
  total: number
} => {
  const abonnementElec = getAbonnementElectriciteAnnuel(puissancePacKva)

  return {
    abonnementElec,
    entretien: entretienPac,
    total: abonnementElec + entretienPac,
  }
}
