import type { ClasseDPE } from "@/types/dpe"

/**
 * Types pour l'API Mes Aides Réno (Beta.gouv)
 * https://mesaidesreno.beta.gouv.fr/api-doc
 */

/**
 * Paramètres d'entrée pour l'API Mes Aides Réno
 */
export interface MesAidesRenoRequestParams {
  code_insee: string // Code INSEE de la commune
  revenu_fiscal_reference: number // Revenu fiscal de référence (RFR)
  nombre_personnes_menage: number // Nombre de personnes dans le foyer
  type_logement: "maison" | "appartement"
  surface_logement: number // Surface habitable du logement (m²) - OBLIGATOIRE
  annee_construction?: number // Année de construction du logement
  classe_dpe?: ClasseDPE // Classe DPE actuelle
  type_chauffage_actuel?: string // Type de chauffage actuel
  type_travaux: string // Type de travaux (ex: "pac_air_eau", "pac_air_air", etc.)
  cout_projet: number // Coût total du projet (€ TTC)
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
