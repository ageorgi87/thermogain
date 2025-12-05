import type { ProjectData } from "@/types/projectData"
import { ELECTRICITY_SUBSCRIPTION_ANNUAL, GAS_SUBSCRIPTION } from "@/config/constants"
import { isElectricHeating, requiresGasSubscription } from "@/app/(main)/[projectId]/lib/calculateAllResults/helpers/energyTypeDetectors"

/**
 * Calcule les coûts FIXES annuels du système actuel
 * Inclut: abonnement électricité (si chauffage électrique), abonnement gaz (si applicable), entretien
 *
 * IMPORTANT: Pour isoler le coût du système de chauffage, l'abonnement électricité
 * n'est inclus QUE si le mode de chauffage utilise l'électricité.
 *
 * @param data Données du projet
 * @returns Objet détaillant les coûts fixes
 */
export const calculateCurrentFixedCosts = (data: ProjectData): {
  abonnementElec: number
  abonnementGaz: number
  entretien: number
  total: number
} => {
  const puissanceActuelle = data.puissance_souscrite_actuelle || 6

  // Abonnement électricité: uniquement pour les chauffages électriques ou PAC
  const abonnementElec = isElectricHeating(data.type_chauffage || "")
    ? ELECTRICITY_SUBSCRIPTION_ANNUAL[
        puissanceActuelle as keyof typeof ELECTRICITY_SUBSCRIPTION_ANNUAL
      ]
    : 0

  // Abonnement gaz: uniquement pour chauffage au gaz
  const abonnementGaz = requiresGasSubscription(data.type_chauffage || "")
    ? data.abonnement_gaz || GAS_SUBSCRIPTION.ANNUAL_AVERAGE
    : 0

  // Entretien: utilise la valeur renseignée par l'utilisateur
  const entretien = data.entretien_annuel || 0

  return {
    abonnementElec,
    abonnementGaz,
    entretien,
    total: abonnementElec + abonnementGaz + entretien,
  }
}
