/**
 * Barèmes d'abonnement électricité et gaz 2025
 * Sources officielles: EDF, Engie, CRE (Commission de Régulation de l'Énergie)
 *
 * IMPORTANT: Les valeurs constantes proviennent de @/config/constants
 */

import {
  ELECTRICITY_SUBSCRIPTION_ANNUAL,
  MAINTENANCE_COSTS_ANNUAL,
} from "@/config/constants"

/**
 * Barème abonnement électricité selon puissance souscrite
 * Source: EDF Tarif Bleu - En vigueur depuis 1er août 2025
 */
export const ABONNEMENT_ELECTRICITE_ANNUEL = ELECTRICITY_SUBSCRIPTION_ANNUAL

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
