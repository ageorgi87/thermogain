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
  ecs_integrated?: boolean               // ECS intégrée au chauffage actuel ? (chaudière mixte)

  // ECS séparé (si ecs_integrated = false) - Décembre 2024
  type_ecs?: string                      // Type de système ECS ("Ballon électrique", "Thermodynamique", etc.)
  conso_ecs_kwh?: number                 // Consommation ECS annuelle (kWh/an)
  prix_ecs_kwh?: number                  // Prix énergie ECS (€/kWh)
  entretien_ecs?: number                 // Entretien ECS annuel (€/an)

  // Projet PAC
  type_pac: string
  puissance_pac_kw: number
  cop_estime: number // COP nominal du fabricant
  cop_ajuste: number // COP réel ajusté (émetteurs, climat)
  emetteurs: string  // Type d'émetteurs (détermine automatiquement la température de départ)
  duree_vie_pac: number

  // Nouveaux champs PAC pour coûts fixes (Novembre 2024)
  puissance_souscrite_pac?: number     // Puissance souscrite électrique pour PAC (kVA)
  entretien_pac_annuel?: number        // Coût d'entretien annuel PAC (€/an)
  prix_elec_pac?: number               // Prix électricité pour PAC (€/kWh), si différent du prix actuel

  // Gestion ECS par la PAC (Décembre 2024)
  with_ecs_management?: boolean        // La PAC gérera-t-elle l'ECS ?
  cop_ecs?: number                     // COP PAC pour production ECS (≈ cop_estime × 0.85)

  // Logement (pour estimation ECS + besoins énergétiques DPE) - Décembre 2024
  nombre_occupants?: number            // Nombre d'occupants (pour estimation besoins ECS)
  classe_dpe?: string                  // Classe DPE du logement (A-G) - pour calcul besoins théoriques
  surface_logement?: number            // Surface habitable (m²) - pour calcul besoins théoriques DPE

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
