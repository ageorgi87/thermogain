"use server"

import { getProject } from "./getProject"
import type { ProjectData } from "@/types/projectData"

/**
 * Récupère les données d'un projet et les transforme en format ProjectData
 * utilisé par les fonctions de calcul
 *
 * @param projectId - ID du projet
 * @returns Données du projet au format ProjectData
 * @throws Error si le projet n'existe pas ou si les données sont incomplètes
 */
export const getProjectData = async (projectId: string): Promise<ProjectData> => {
  const project = await getProject(projectId)

  if (!project) {
    throw new Error(`Projet ${projectId} introuvable`)
  }

  // Vérifier que toutes les données nécessaires sont présentes
  if (
    !project.logement ||
    !project.chauffageActuel ||
    !project.projetPac ||
    !project.couts ||
    !project.aides
  ) {
    throw new Error(`Données incomplètes pour le projet ${projectId}`)
  }

  const prixElecKwh = project.projetPac.prix_elec_kwh || 0

  return {
    type_chauffage: project.chauffageActuel.type_chauffage,
    conso_fioul_litres: project.chauffageActuel.conso_fioul_litres || undefined,
    prix_fioul_litre: project.chauffageActuel.prix_fioul_litre || undefined,
    conso_gaz_kwh: project.chauffageActuel.conso_gaz_kwh || undefined,
    prix_gaz_kwh: project.chauffageActuel.prix_gaz_kwh || undefined,
    conso_gpl_kg: project.chauffageActuel.conso_gpl_kg || undefined,
    prix_gpl_kg: project.chauffageActuel.prix_gpl_kg || undefined,
    conso_pellets_kg: project.chauffageActuel.conso_pellets_kg || undefined,
    prix_pellets_kg: project.chauffageActuel.prix_pellets_kg || undefined,
    conso_bois_steres: project.chauffageActuel.conso_bois_steres || undefined,
    prix_bois_stere: project.chauffageActuel.prix_bois_stere || undefined,
    conso_elec_kwh: project.chauffageActuel.conso_elec_kwh || undefined,
    prix_elec_kwh: prixElecKwh,
    cop_actuel: project.chauffageActuel.cop_actuel || undefined,
    conso_pac_kwh: project.chauffageActuel.conso_pac_kwh || undefined,

    // Coûts fixes système actuel
    puissance_souscrite_actuelle: project.projetPac.puissance_souscrite_actuelle || undefined,
    abonnement_gaz: project.chauffageActuel.abonnement_gaz || undefined,
    entretien_annuel: project.chauffageActuel.entretien_annuel || undefined,

    type_pac: project.projetPac.type_pac,
    puissance_pac_kw: project.projetPac.puissance_pac_kw,
    cop_estime: project.projetPac.cop_estime,
    temperature_depart: project.projetPac.temperature_depart || 45,
    emetteurs: project.projetPac.emetteurs || "Radiateurs basse température",
    duree_vie_pac: project.projetPac.duree_vie_pac,

    // Coûts fixes PAC
    puissance_souscrite_pac: project.projetPac.puissance_souscrite_pac || undefined,
    entretien_pac_annuel: project.projetPac.entretien_pac_annuel || undefined,
    prix_elec_pac: project.projetPac.prix_elec_pac || undefined,

    code_postal: project.logement.code_postal || undefined,
    cout_total: project.couts.cout_total,
    reste_a_charge: project.couts.cout_total - project.aides.total_aides,

    mode_financement: project.financement?.mode_financement || undefined,
    montant_credit: project.financement?.montant_credit || undefined,
    taux_interet: project.financement?.taux_interet || undefined,
    duree_credit_mois: project.financement?.duree_credit_mois || undefined,
    apport_personnel: project.financement?.apport_personnel || undefined,
  }
}
