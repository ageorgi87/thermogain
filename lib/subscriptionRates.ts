/**
 * Barèmes d'abonnement électricité et gaz 2024
 * Sources officielles: EDF, Engie, CRE (Commission de Régulation de l'Énergie)
 *
 * Ce module centralise tous les tarifs réglementés et moyens pour:
 * - Abonnements électricité selon puissance souscrite
 * - Abonnements gaz
 * - Coûts d'entretien moyens par type de chauffage
 *
 * Dernière mise à jour: Novembre 2024
 */

// ============================================================================
// ABONNEMENTS ÉLECTRICITÉ - TARIF RÉGLEMENTÉ EDF (TTC)
// ============================================================================

/**
 * Barème abonnement électricité selon puissance souscrite
 * Source: EDF Tarif Bleu - Novembre 2024
 * Prix TTC incluant: acheminement (TURPE), taxes (CSPE, CTA), TVA 5.5% sur abonnement
 */
export const ABONNEMENT_ELECTRICITE_ANNUEL: Record<number, number> = {
  3: 115,   // 3 kVA : 115 €/an (~9.60 €/mois) - Très petit logement, usage minimal
  6: 151,   // 6 kVA : 151 €/an (~12.60 €/mois) - Logement standard sans chauffage électrique
  9: 189,   // 9 kVA : 189 €/an (~15.75 €/mois) - Logement avec PAC ou chauffage élec
  12: 228,  // 12 kVA : 228 €/an (~19.00 €/mois) - Grande maison avec PAC puissante
  15: 264,  // 15 kVA : 264 €/an (~22.00 €/mois) - Très grande maison ou usage professionnel
  18: 301,  // 18 kVA : 301 €/an (~25.08 €/mois) - Usage professionnel ou très grande maison
}

/**
 * Récupère le coût d'abonnement électrique annuel selon la puissance souscrite
 * @param puissanceKva - Puissance souscrite en kVA (3, 6, 9, 12, 15, 18)
 * @returns Coût annuel de l'abonnement en euros TTC
 */
export function getAbonnementElectriciteAnnuel(puissanceKva: number): number {
  const tarif = ABONNEMENT_ELECTRICITE_ANNUEL[puissanceKva]
  if (!tarif) {
    console.warn(`Puissance ${puissanceKva} kVA non reconnue, utilisation 6 kVA par défaut`)
    return ABONNEMENT_ELECTRICITE_ANNUEL[6]
  }
  return tarif
}

/**
 * Calcule la différence d'abonnement électrique entre deux puissances
 * Utilisé pour calculer le surcoût d'abonnement lors de l'installation d'une PAC
 *
 * @param puissanceActuelle - Puissance souscrite actuelle en kVA
 * @param puissancePac - Puissance recommandée pour la PAC en kVA
 * @returns Delta d'abonnement annuel en euros (positif = augmentation, négatif = diminution)
 */
export function getDeltaAbonnementElectricite(
  puissanceActuelle: number,
  puissancePac: number
): number {
  const abonnementActuel = getAbonnementElectriciteAnnuel(puissanceActuelle)
  const abonnementPac = getAbonnementElectriciteAnnuel(puissancePac)
  return abonnementPac - abonnementActuel
}

// ============================================================================
// ABONNEMENT GAZ - TARIF RÉGLEMENTÉ ENGIE (TTC)
// ============================================================================

/**
 * Coût moyen annuel d'abonnement gaz naturel
 * Source: Engie Tarif Réglementé - Novembre 2024
 * Prix TTC incluant: acheminement (ATRD), taxes (TICGN, CTA), TVA 5.5% sur abonnement
 *
 * Valeur moyenne pour consommation standard chauffage (12000-20000 kWh/an)
 */
export const ABONNEMENT_GAZ_ANNUEL_MOYEN = 120

/**
 * Barème détaillé abonnement gaz selon consommation annuelle
 * Les tarifs varient selon la tranche de consommation (Base, B0, B1, B2i)
 */
export const ABONNEMENT_GAZ_PAR_TRANCHE: Record<string, number> = {
  base: 103,        // 0-1000 kWh/an - Eau chaude uniquement
  B0: 120,          // 1000-6000 kWh/an - Eau chaude + cuisson
  B1: 120,          // 6000-30000 kWh/an - Chauffage petit/moyen logement
  B2i: 267,         // 30000-300000 kWh/an - Chauffage grand logement/collectif
}

// ============================================================================
// COÛTS D'ENTRETIEN ANNUELS MOYENS PAR TYPE DE CHAUFFAGE
// ============================================================================

/**
 * Coûts moyens d'entretien annuel par type de chauffage
 * Sources: ADEME, syndicats professionnels, moyennes marché 2024
 *
 * Notes importantes:
 * - Entretien chaudière gaz/fioul: OBLIGATOIRE annuellement (décret n°2009-649)
 * - Entretien PAC: Fortement recommandé annuellement, obligatoire tous les 2 ans
 * - Prix incluent: visite technicien, nettoyage, réglages, attestation
 */
export const ENTRETIEN_ANNUEL_MOYEN: Record<string, number> = {
  "Gaz": 120,           // Chaudière gaz: ramonage, nettoyage brûleur, contrôle combustion
  "Fioul": 150,         // Chaudière fioul: ramonage obligatoire, nettoyage complet
  "GPL": 130,           // Chaudière GPL: similaire gaz + spécificités GPL
  "Pellets": 100,       // Poêle/chaudière pellets: nettoyage, ramonage
  "Bois": 80,           // Poêle bois: ramonage (2x/an si usage principal)
  "Électricité": 0,     // Chauffage électrique direct: aucun entretien obligatoire
  "PAC": 120,           // PAC: contrôle étanchéité, fluide frigorigène, nettoyage filtres
}

/**
 * Récupère le coût d'entretien annuel moyen selon le type de chauffage
 * @param typeChauffage - Type de système de chauffage
 * @returns Coût annuel d'entretien en euros
 */
export function getEntretienAnnuelMoyen(typeChauffage: string): number {
  const cout = ENTRETIEN_ANNUEL_MOYEN[typeChauffage]
  if (cout === undefined) {
    console.warn(`Type de chauffage "${typeChauffage}" non reconnu, utilisation 100€ par défaut`)
    return 100
  }
  return cout
}

// ============================================================================
// PUISSANCE SOUSCRITE RECOMMANDÉE SELON PUISSANCE PAC
// ============================================================================

/**
 * Détermine la puissance souscrite électrique recommandée selon la puissance de la PAC
 *
 * Logique de calcul:
 * - On part de la puissance actuelle du client (qui couvre déjà tous ses besoins existants)
 * - On ajoute la puissance de la PAC (sans marge car coefficient de foisonnement)
 * - Le coefficient de foisonnement suppose que la PAC ne démarre pas toujours au moment
 *   où tous les autres appareils du logement sont en marche simultanément
 * - On arrondit à la tranche EDF supérieure (3, 6, 9, 12, 15, 18 kVA)
 *
 * Exemples:
 * - Client 6 kVA + PAC 8 kW → 6 + 8 = 14 kVA → arrondi à 15 kVA
 * - Client 9 kVA + PAC 6 kW → 9 + 6 = 15 kVA → reste à 15 kVA
 * - Client 12 kVA + PAC 10 kW → 12 + 10 = 22 kVA → plafonne à 18 kVA (max standard)
 *
 * @param puissancePacKw - Puissance nominale de la PAC en kW
 * @param puissanceActuelleKva - Puissance souscrite actuelle en kVA
 * @returns Puissance recommandée en kVA (6, 9, 12, 15, ou 18)
 */
export function getPuissanceSouscritePacRecommandee(
  puissancePacKw: number,
  puissanceActuelleKva: number
): number {
  // Calcul théorique: puissance actuelle + puissance PAC
  // Pas de marge car on compte sur le foisonnement (tous les appareils ne sont pas en marche en même temps)
  const puissanceTheorique = puissanceActuelleKva + puissancePacKw

  // Détermination par tranches (arrondissement à la tranche supérieure)
  let puissanceRecommandee: number

  if (puissanceTheorique <= 6) {
    puissanceRecommandee = 6
  } else if (puissanceTheorique <= 9) {
    puissanceRecommandee = 9
  } else if (puissanceTheorique <= 12) {
    puissanceRecommandee = 12
  } else if (puissanceTheorique <= 15) {
    puissanceRecommandee = 15
  } else {
    puissanceRecommandee = 18
  }

  return puissanceRecommandee
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Calcule le coût total fixe annuel (abonnements + entretien) pour le système actuel
 *
 * @param typeChauffage - Type de système de chauffage actuel
 * @param puissanceElecActuelle - Puissance souscrite électrique actuelle en kVA
 * @param abonnementGaz - Coût abonnement gaz si applicable (0 sinon)
 * @returns Coût total annuel des frais fixes (€/an)
 */
export function getCoutFixeAncienSysteme(
  typeChauffage: string,
  puissanceElecActuelle: number,
  abonnementGaz: number = 0
): {
  abonnementElec: number
  abonnementGaz: number
  entretien: number
  total: number
} {
  const abonnementElec = getAbonnementElectriciteAnnuel(puissanceElecActuelle)
  const entretien = getEntretienAnnuelMoyen(typeChauffage)

  return {
    abonnementElec,
    abonnementGaz,
    entretien,
    total: abonnementElec + abonnementGaz + entretien,
  }
}

/**
 * Calcule le coût total fixe annuel (abonnement + entretien) pour la PAC
 *
 * @param puissancePacKva - Puissance souscrite électrique pour la PAC en kVA
 * @param entretienPac - Coût d'entretien annuel de la PAC (défaut 120€)
 * @returns Coût total annuel des frais fixes (€/an)
 */
export function getCoutFixePac(
  puissancePacKva: number,
  entretienPac: number = 120
): {
  abonnementElec: number
  entretien: number
  total: number
} {
  const abonnementElec = getAbonnementElectriciteAnnuel(puissancePacKva)

  return {
    abonnementElec,
    entretien: entretienPac,
    total: abonnementElec + entretienPac,
  }
}

/**
 * Résumé complet de l'impact financier de l'installation d'une PAC sur les coûts fixes
 *
 * @param typeChauffageActuel - Type de chauffage actuel
 * @param puissanceElecActuelle - Puissance souscrite actuelle en kVA
 * @param abonnementGazActuel - Abonnement gaz actuel (0 si pas de gaz)
 * @param puissancePacKva - Puissance souscrite recommandée pour PAC en kVA
 * @param entretienPac - Coût entretien PAC (défaut 120€)
 * @returns Analyse détaillée des économies/surcoûts sur coûts fixes
 */
export function analyseImpactCoutsFixes(
  typeChauffageActuel: string,
  puissanceElecActuelle: number,
  abonnementGazActuel: number,
  puissancePacKva: number,
  entretienPac: number = 120
): {
  ancien: ReturnType<typeof getCoutFixeAncienSysteme>
  pac: ReturnType<typeof getCoutFixePac>
  delta: {
    abonnementElec: number
    abonnementGaz: number
    entretien: number
    total: number
  }
} {
  const ancien = getCoutFixeAncienSysteme(
    typeChauffageActuel,
    puissanceElecActuelle,
    abonnementGazActuel
  )

  const pac = getCoutFixePac(puissancePacKva, entretienPac)

  const entretienAncien = getEntretienAnnuelMoyen(typeChauffageActuel)

  return {
    ancien,
    pac,
    delta: {
      abonnementElec: pac.abonnementElec - ancien.abonnementElec,
      abonnementGaz: -abonnementGazActuel, // Suppression abonnement gaz
      entretien: entretienPac - entretienAncien,
      total: pac.total - ancien.total,
    },
  }
}
