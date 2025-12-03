import { getCoutFixeAncienSysteme } from "./getCoutFixeAncienSysteme"
import { getCoutFixePac } from "./getCoutFixePac"
import { getEntretienAnnuelMoyen } from "./getEntretienAnnuelMoyen"

/**
 * Résumé complet de l'impact financier de l'installation d'une PAC sur les coûts fixes
 *
 * @param typeChauffageActuel - Type de chauffage actuel
 * @param puissanceElecActuelle - Puissance souscrite actuelle en kVA
 * @param abonnementGazActuel - Abonnement gaz actuel (0 si pas de gaz)
 * @param puissancePacKva - Puissance souscrite recommandée pour PAC en kVA
 * @param entretienPac - Coût entretien PAC (défaut 120€)
 * @returns Analyse détaillée des économies/surcoûts sur coûts fixes
 */
export const analyseImpactCoutsFixes = (
  typeChauffageActuel: string,
  puissanceElecActuelle: number,
  abonnementGazActuel: number,
  puissancePacKva: number,
  entretienPac: number = 120
): {
  ancien: ReturnType<typeof getCoutFixeAncienSysteme>
  pac: ReturnType<typeof getCoutFixePac>
  delta: {
    abonnementElec: number
    abonnementGaz: number
    entretien: number
    total: number
  }
} => {
  const ancien = getCoutFixeAncienSysteme(
    typeChauffageActuel,
    puissanceElecActuelle,
    abonnementGazActuel
  )

  const pac = getCoutFixePac(puissancePacKva, entretienPac)

  const entretienAncien = getEntretienAnnuelMoyen(typeChauffageActuel)

  return {
    ancien,
    pac,
    delta: {
      abonnementElec: pac.abonnementElec - ancien.abonnementElec,
      abonnementGaz: -abonnementGazActuel, // Suppression abonnement gaz
      entretien: entretienPac - entretienAncien,
      total: pac.total - ancien.total,
    },
  }
}
