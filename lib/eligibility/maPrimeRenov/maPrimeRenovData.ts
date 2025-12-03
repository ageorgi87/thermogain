/**
 * Types, interfaces et constantes pour MaPrimeRénov'
 *
 * Basé sur les barèmes officiels 2024
 * Source : https://www.anah.gouv.fr
 */

export type MaPrimeRenovCategory = "bleu" | "jaune" | "violet" | "rose" | "non-eligible"

export interface MaPrimeRenovInput {
  revenuFiscalReference: number  // Revenu fiscal de référence (année N-1)
  nombrePersonnes: number         // Nombre de personnes dans le foyer
  codePostal: string             // Pour déterminer si Île-de-France ou province
  typePac: string                // Type de PAC installée
  logementPlusde15ans: boolean   // Le logement a-t-il plus de 15 ans ?
  residencePrincipale: boolean   // Est-ce une résidence principale ?
  remplacementComplet: boolean   // Le système de chauffage actuel sera-t-il complètement remplacé ?
}

export interface MaPrimeRenovResult {
  eligible: boolean
  category?: MaPrimeRenovCategory
  montant: number
  message: string
  details?: string[]
}

/**
 * Barèmes de revenus MaPrimeRénov' 2024
 * Source officielle : ANAH
 */
export const BAREME_IDF_2024: Record<number, { bleu: number; jaune: number; violet: number; rose: number }> = {
  1: { bleu: 23541, jaune: 28657, violet: 40018, rose: Infinity },
  2: { bleu: 34551, jaune: 42058, violet: 58827, rose: Infinity },
  3: { bleu: 41493, jaune: 50513, violet: 70382, rose: Infinity },
  4: { bleu: 48447, jaune: 58981, violet: 82839, rose: Infinity },
  5: { bleu: 55427, jaune: 67473, violet: 94844, rose: Infinity },
  // +6961 par personne supplémentaire pour bleu
  // +8486 par personne supplémentaire pour jaune
  // +11995 par personne supplémentaire pour violet
}

export const BAREME_PROVINCE_2024: Record<number, { bleu: number; jaune: number; violet: number; rose: number }> = {
  1: { bleu: 17009, jaune: 21805, violet: 30549, rose: Infinity },
  2: { bleu: 24875, jaune: 31889, violet: 44907, rose: Infinity },
  3: { bleu: 29917, jaune: 38349, violet: 54071, rose: Infinity },
  4: { bleu: 34948, jaune: 44802, violet: 63235, rose: Infinity },
  5: { bleu: 40002, jaune: 51281, violet: 72400, rose: Infinity },
  // +5045 par personne supplémentaire pour bleu
  // +6462 par personne supplémentaire pour jaune
  // +9165 par personne supplémentaire pour violet
}

export const MONTANTS_PAC_2024: Record<MaPrimeRenovCategory, Record<string, number>> = {
  bleu: {
    "Air/Eau": 5000,
    "Eau/Eau": 5000,
    "Air/Air": 0, // Non éligible
  },
  jaune: {
    "Air/Eau": 4000,
    "Eau/Eau": 4000,
    "Air/Air": 0,
  },
  violet: {
    "Air/Eau": 3000,
    "Eau/Eau": 3000,
    "Air/Air": 0,
  },
  rose: {
    "Air/Eau": 0, // Non éligible pour rose
    "Eau/Eau": 0,
    "Air/Air": 0,
  },
  "non-eligible": {
    "Air/Eau": 0,
    "Eau/Eau": 0,
    "Air/Air": 0,
  },
}
