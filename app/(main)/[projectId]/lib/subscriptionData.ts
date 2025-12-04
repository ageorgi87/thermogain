/**
 * Barèmes d'abonnement électricité et gaz 2025
 * Sources officielles: EDF, Engie, CRE (Commission de Régulation de l'Énergie)
 *
 * IMPORTANT: Les valeurs constantes proviennent de @/config/constants
 */

import {
  ELECTRICITY_SUBSCRIPTION_ANNUAL,
  GAS_SUBSCRIPTION,
  MAINTENANCE_COSTS_ANNUAL,
} from "@/config/constants"

/**
 * Barème abonnement électricité selon puissance souscrite
 * Source: EDF Tarif Bleu - En vigueur depuis 1er août 2025
 */
export const ABONNEMENT_ELECTRICITE_ANNUEL = ELECTRICITY_SUBSCRIPTION_ANNUAL

/**
 * Coût moyen annuel d'abonnement gaz naturel
 * Source: Engie Tarif Réglementé - Novembre 2024
 */
export const ABONNEMENT_GAZ_ANNUEL_MOYEN = GAS_SUBSCRIPTION.ANNUAL_AVERAGE

/**
 * Barème détaillé abonnement gaz selon consommation annuelle
 */
export const ABONNEMENT_GAZ_PAR_TRANCHE: Record<string, number> = {
  base: GAS_SUBSCRIPTION.BY_CONSUMPTION.BASE,
  B0: GAS_SUBSCRIPTION.BY_CONSUMPTION.B0,
  B1: GAS_SUBSCRIPTION.BY_CONSUMPTION.B1,
  B2i: GAS_SUBSCRIPTION.BY_CONSUMPTION.B2I,
}

/**
 * Coûts moyens d'entretien annuel par type de chauffage
 * Sources: ADEME, syndicats professionnels, moyennes marché 2024
 */
export const ENTRETIEN_ANNUEL_MOYEN: Record<string, number> = {
  Gaz: MAINTENANCE_COSTS_ANNUAL.GAZ,
  Fioul: MAINTENANCE_COSTS_ANNUAL.FIOUL,
  GPL: MAINTENANCE_COSTS_ANNUAL.GPL,
  Pellets: MAINTENANCE_COSTS_ANNUAL.PELLETS,
  Bois: MAINTENANCE_COSTS_ANNUAL.BOIS,
  Électricité: MAINTENANCE_COSTS_ANNUAL.ELECTRIQUE,
  PAC: MAINTENANCE_COSTS_ANNUAL.PAC,
}
