import { ENTRETIEN_ANNUEL_MOYEN } from "@/lib/subscriptionData"

/**
 * Récupère le coût d'entretien annuel moyen selon le type de chauffage
 * @param typeChauffage - Type de système de chauffage
 * @returns Coût annuel d'entretien en euros
 */
export const getEntretienAnnuelMoyen = (typeChauffage: string): number => {
  const cout = ENTRETIEN_ANNUEL_MOYEN[typeChauffage]
  if (cout === undefined) {
    console.warn(
      `Type de chauffage "${typeChauffage}" non reconnu, utilisation 100€ par défaut`
    )
    return 100
  }
  return cout
}
