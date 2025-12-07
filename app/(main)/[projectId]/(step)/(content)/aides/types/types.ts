import type { ClasseDPE } from "@/types/dpe"

/**
 * Types pour l'API Mes Aides Réno (Beta.gouv)
 * https://mesaidesreno.beta.gouv.fr/api-doc
 */

/**
 * Données brutes du projet récupérées depuis la DB
 * Pour être passées aux fonctions calculateAidesXXX
 */
export interface ProjectDataForAides {
  // Logement
  code_postal: string
  annee_construction: number | null
  nombre_occupants: number
  classe_dpe: ClasseDPE

  // Aides (critères utilisateur)
  type_logement: "maison" | "appartement"
  surface_logement: number
  revenu_fiscal_reference: number
  residence_principale: boolean

  // Chauffage actuel
  type_chauffage_actuel: string | null

  // Projet PAC
  type_pac: string // Format ThermoGain: "Air/Eau", "Eau/Eau", "Air/Air"
  cop_estime: number // COP nominal du fabricant (pour calcul Etas)

  // Coûts
  cout_pac: number
  cout_installation: number
}

/**
 * Réponse de l'API Mes Aides Réno
 */
export interface MesAidesRenoResponse {
  // Aides calculées
  aides: {
    ma_prime_renov?: MaPrimeRenovAide
    cee?: CEEAide
    autres_aides?: AutresAides[]
  }

  // Total des aides
  total_aides: number

  // Reste à charge
  reste_a_charge: number

  // Informations sur l'éligibilité
  eligibilite: {
    eligible_ma_prime_renov: boolean
    eligible_cee: boolean
    raisons_ineligibilite?: string[]
  }

  // Métadonnées
  metadata: {
    date_calcul: string
    version_bareme: string
  }
}

/**
 * Détail de l'aide MaPrimeRénov'
 */
export interface MaPrimeRenovAide {
  montant: number
  categorie_menage: "bleu" | "jaune" | "violet" | "rose"
  plafond_depenses: number
  taux_prise_en_charge: number // Pourcentage (0-100)
}

/**
 * Détail de l'aide CEE (Certificats d'Économies d'Énergie)
 */
export interface CEEAide {
  montant: number
  categorie_menage: "precaire" | "modeste" | "classique"
  kwhc_cumac: number // Économies d'énergie en kWh cumac
}

/**
 * Autres aides disponibles
 */
export interface AutresAides {
  nom: string
  organisme: string
  montant: number
  description?: string
  lien?: string
}
