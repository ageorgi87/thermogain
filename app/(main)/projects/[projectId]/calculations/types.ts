// Types pour les calculs
export interface ProjectData {
  // Chauffage actuel
  type_chauffage: string
  conso_fioul_litres?: number
  prix_fioul_litre?: number
  conso_gaz_kwh?: number
  prix_gaz_kwh?: number
  conso_gpl_kg?: number
  prix_gpl_kg?: number
  conso_pellets_kg?: number
  prix_pellets_kg?: number
  conso_bois_steres?: number
  prix_bois_stere?: number
  conso_elec_kwh?: number
  prix_elec_kwh?: number
  cop_actuel?: number
  conso_pac_kwh?: number

  // Nouveaux champs pour coûts fixes et abonnements (Novembre 2024)
  puissance_souscrite_actuelle?: number  // Puissance souscrite électrique actuelle (kVA)
  abonnement_gaz?: number                // Abonnement gaz annuel (€/an) - pour type_chauffage = "Gaz"
  entretien_annuel?: number              // Coût d'entretien annuel système actuel (€/an)

  // Projet PAC
  type_pac: string
  puissance_pac_kw: number
  cop_estime: number
  temperature_depart: number
  emetteurs: string
  duree_vie_pac: number

  // Nouveaux champs PAC pour coûts fixes (Novembre 2024)
  puissance_souscrite_pac?: number     // Puissance souscrite électrique pour PAC (kVA)
  entretien_pac_annuel?: number        // Coût d'entretien annuel PAC (€/an)
  prix_elec_pac?: number               // Prix électricité pour PAC (€/kWh), si différent du prix actuel

  // Code postal pour ajustement climatique COP
  code_postal?: string

  // Coûts
  cout_total: number

  // Aides
  reste_a_charge: number

  // Évolutions (DEPRECATED - Novembre 2024)
  // Les taux d'évolution sont maintenant calculés automatiquement via le modèle Mean Reversion
  // depuis l'API DIDO-SDES. Ces champs sont conservés pour compatibilité mais ne sont plus utilisés.
  evolution_prix_fioul?: number
  evolution_prix_gaz?: number
  evolution_prix_gpl?: number
  evolution_prix_bois?: number
  evolution_prix_electricite?: number

  // Financement
  mode_financement?: string
  montant_credit?: number
  taux_interet?: number
  duree_credit_mois?: number
  apport_personnel?: number
}

export interface YearlyData {
  year: number
  coutActuel: number
  coutPac: number
  economie: number
  economiesCumulees: number
}

export interface CalculationResults {
  // Coûts année 1
  coutAnnuelActuel: number
  coutAnnuelPac: number
  economiesAnnuelles: number

  // Projections
  yearlyData: YearlyData[]

  // ROI
  paybackPeriod: number | null // En années
  paybackYear: number | null   // Année calendaire

  // Gains totaux sur durée de vie PAC
  totalSavingsLifetime: number
  netBenefitLifetime: number
  tauxRentabilite: number | null // Taux de rentabilité annuel moyen en %

  // Coûts totaux sur durée de vie
  coutTotalActuelLifetime: number  // Coût total chauffage actuel sur durée de vie PAC
  coutTotalPacLifetime: number     // Coût total PAC (investissement + électricité) sur durée de vie

  // Coûts mensuels
  coutMensuelActuel: number
  coutMensuelPac: number
  economieMensuelle: number

  // Financement
  mensualiteCredit?: number
  coutTotalCredit?: number
  investissementReel: number // Investissement réel incluant les intérêts du crédit
}
