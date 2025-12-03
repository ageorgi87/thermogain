/**
 * Types, interfaces et constantes pour les CEE (Certificats d'Économies d'Énergie)
 *
 * Basé sur les fiches standardisées CEE et les barèmes 2024
 * Les CEE sont cumulables avec MaPrimeRénov'
 */

export type CEECategory = "precaire" | "modeste" | "classique" | "non-eligible"

export interface CEEInput {
  revenuFiscalReference: number  // Revenu fiscal de référence (année N-1)
  nombrePersonnes: number         // Nombre de personnes dans le foyer
  codePostal: string             // Pour déterminer zone géographique et précarité
  typePac: string                // Type de PAC installée
  surfaceHabitable: number       // Surface pour calcul selon fiche CEE
  zoneClimatique: string         // H1, H2, H3 (déterminé par code postal)
  logementPlusde2ans: boolean    // Le logement a-t-il plus de 2 ans ?
  remplacementComplet: boolean   // Le système de chauffage actuel sera-t-il complètement remplacé ?
}

export interface CEEResult {
  eligible: boolean
  category?: CEECategory
  montant: number
  message: string
  details?: string[]
}

/**
 * Barèmes de précarité CEE 2024 (identiques aux seuils MaPrimeRénov' bleu et jaune)
 */
export const SEUILS_PRECARITE_IDF_2024: Record<number, { precaire: number; modeste: number }> = {
  1: { precaire: 23541, modeste: 28657 },
  2: { precaire: 34551, modeste: 42058 },
  3: { precaire: 41493, modeste: 50513 },
  4: { precaire: 48447, modeste: 58981 },
  5: { precaire: 55427, modeste: 67473 },
}

export const SEUILS_PRECARITE_PROVINCE_2024: Record<number, { precaire: number; modeste: number }> = {
  1: { precaire: 17009, modeste: 21805 },
  2: { precaire: 24875, modeste: 31889 },
  3: { precaire: 29917, modeste: 38349 },
  4: { precaire: 34948, modeste: 44802 },
  5: { precaire: 40002, modeste: 51281 },
}

/**
 * Montants forfaitaires CEE 2024 pour PAC
 * Basé sur fiche BAR-TH-104 (PAC Air/Eau) et BAR-TH-148 (PAC Air/Air)
 *
 * Montants indicatifs moyens (peuvent varier selon les obligés CEE)
 */
export const MONTANTS_CEE_PAC_2024: Record<CEECategory, Record<string, number>> = {
  precaire: {
    "Air/Eau": 5000,
    "Eau/Eau": 5000,
    "Air/Air": 900, // CEE Coup de Pouce
  },
  modeste: {
    "Air/Eau": 4000,
    "Eau/Eau": 4000,
    "Air/Air": 450,
  },
  classique: {
    "Air/Eau": 2500,
    "Eau/Eau": 2500,
    "Air/Air": 0, // Non éligible sans précarité
  },
  "non-eligible": {
    "Air/Eau": 0,
    "Eau/Eau": 0,
    "Air/Air": 0,
  },
}
