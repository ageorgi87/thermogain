import { TypeChauffageActuel } from "@/types/typeChauffageActuel"

/**
 * Détecteurs de types d'énergie
 * Centralise la logique de détection des caractéristiques énergétiques
 */

/**
 * Vérifie si le type de chauffage est électrique
 */
export const isElectricHeating = (typeChauffage: string): boolean => {
  return [
    TypeChauffageActuel.ELECTRIQUE,
    TypeChauffageActuel.PAC_AIR_AIR,
    TypeChauffageActuel.PAC_AIR_EAU,
    TypeChauffageActuel.PAC_EAU_EAU
  ].includes(typeChauffage as TypeChauffageActuel)
}

/**
 * Vérifie si le type de chauffage nécessite un abonnement gaz
 */
export const requiresGasSubscription = (typeChauffage: string): boolean => {
  return typeChauffage === TypeChauffageActuel.GAZ
}

/**
 * Vérifie si le type de chauffage nécessite un entretien annuel
 */
export const requiresMaintenance = (typeChauffage: string): boolean => {
  // Tous les systèmes sauf électrique simple nécessitent un entretien
  return typeChauffage !== TypeChauffageActuel.ELECTRIQUE
}
