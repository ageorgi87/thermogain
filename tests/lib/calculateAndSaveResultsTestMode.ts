/**
 * Version de calculateAndSaveResults adaptée pour les tests E2E
 * Bypass l'authentification NextAuth qui nécessite un contexte HTTP
 */

import { prisma } from "@/lib/prisma";
import type { ProjectData } from "@/types/projectData";
import { calculateAllResults } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateAllResults";
import { saveProjectResults } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/mutations/saveProjectResults";

/**
 * Récupère les données du projet sans vérification d'authentification
 * Version allégée pour les tests uniquement
 */
const getProjectDataForCalculationsTestMode = async (
  projectId: string
): Promise<ProjectData> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      logement: true,
      chauffageActuel: true,
      ecs: true,
      projetPac: true,
      couts: true,
      aides: true,
      financement: true,
    },
  });

  if (!project) {
    throw new Error(`Projet ${projectId} introuvable`);
  }

  if (
    !project.logement ||
    !project.chauffageActuel ||
    !project.projetPac ||
    !project.couts ||
    !project.aides
  ) {
    throw new Error(`Projet ${projectId} incomplet`);
  }

  // Mapper les données Prisma vers ProjectData
  const data: ProjectData = {
    // Logement
    code_postal: project.logement.code_postal,
    annee_construction: project.logement.annee_construction,
    surface_logement: project.logement.surface_logement,
    nombre_occupants: project.logement.nombre_occupants,
    classe_dpe: project.logement.classe_dpe,

    // Chauffage actuel
    type_chauffage: project.chauffageActuel.type_chauffage,
    age_installation: project.chauffageActuel.age_installation,
    etat_installation: project.chauffageActuel.etat_installation,
    ecs_integrated: project.chauffageActuel.ecs_integrated,
    conso_fioul_litres: project.chauffageActuel.conso_fioul_litres ?? undefined,
    prix_fioul_litre: project.chauffageActuel.prix_fioul_litre ?? undefined,
    conso_gaz_kwh: project.chauffageActuel.conso_gaz_kwh ?? undefined,
    prix_gaz_kwh: project.chauffageActuel.prix_gaz_kwh ?? undefined,
    conso_gpl_kg: project.chauffageActuel.conso_gpl_kg ?? undefined,
    prix_gpl_kg: project.chauffageActuel.prix_gpl_kg ?? undefined,
    conso_pellets_kg: project.chauffageActuel.conso_pellets_kg ?? undefined,
    prix_pellets_kg: project.chauffageActuel.prix_pellets_kg ?? undefined,
    conso_bois_steres: project.chauffageActuel.conso_bois_steres ?? undefined,
    prix_bois_stere: project.chauffageActuel.prix_bois_stere ?? undefined,
    conso_elec_kwh: project.chauffageActuel.conso_elec_kwh ?? undefined,
    prix_elec_kwh: project.chauffageActuel.prix_elec_kwh ?? undefined,
    cop_actuel: project.chauffageActuel.cop_actuel ?? undefined,
    conso_pac_kwh: project.chauffageActuel.conso_pac_kwh ?? undefined,
    abonnement_gaz: project.chauffageActuel.abonnement_gaz ?? undefined,
    entretien_annuel: project.chauffageActuel.entretien_annuel,

    // ECS (si séparé)
    type_production_ecs: project.ecs?.type_production_ecs ?? undefined,
    nombre_douches: project.ecs?.nombre_douches ?? undefined,
    nombre_bains: project.ecs?.nombre_bains ?? undefined,

    // Projet PAC
    type_pac: project.projetPac.type_pac,
    puissance_pac_kw: project.projetPac.puissance_pac_kw,
    cop_estime: project.projetPac.cop_estime,
    cop_ajuste: project.projetPac.cop_ajuste,
    emetteurs: project.projetPac.emetteurs,
    duree_vie_pac: project.projetPac.duree_vie_pac,
    prix_elec_pac:
      project.projetPac.prix_elec_pac ?? project.projetPac.prix_elec_kwh ?? undefined,
    puissance_souscrite_actuelle: project.projetPac.puissance_souscrite_actuelle,
    puissance_souscrite_pac: project.projetPac.puissance_souscrite_pac,
    entretien_pac_annuel: project.projetPac.entretien_pac_annuel,
    with_ecs_management: project.projetPac.with_ecs_management ?? undefined,
    volume_ballon_ecs: project.projetPac.volume_ballon_ecs ?? undefined,
    cop_ecs: project.projetPac.cop_ecs ?? undefined,

    // Coûts
    cout_pac: project.couts.cout_pac,
    cout_installation: project.couts.cout_installation,
    cout_travaux_annexes: project.couts.cout_travaux_annexes,
    cout_total: project.couts.cout_total,

    // Aides
    type_logement: project.aides.type_logement,
    revenu_fiscal_reference: project.aides.revenu_fiscal_reference,
    residence_principale: project.aides.residence_principale,
    remplacement_complet: project.aides.remplacement_complet,
    ma_prime_renov: project.aides.ma_prime_renov,
    cee: project.aides.cee,
    autres_aides: project.aides.autres_aides,
    total_aides: project.aides.total_aides,

    // Reste à charge = coût total - aides
    reste_a_charge: project.couts.cout_total - project.aides.total_aides,

    // Financement
    mode_financement: project.financement?.mode_financement ?? undefined,
    apport_personnel: project.financement?.apport_personnel ?? undefined,
    montant_credit: project.financement?.montant_credit ?? undefined,
    taux_interet: project.financement?.taux_interet ?? undefined,
    duree_credit_mois: project.financement?.duree_credit_mois ?? undefined,
  };

  return data;
};

/**
 * Calcule et sauvegarde les résultats pour un projet (mode test)
 * Version sans authentification pour les tests E2E
 */
export const calculateAndSaveResultsTestMode = async (
  projectId: string
): Promise<void> => {
  try {
    // 1. Récupérer les données du projet
    const data = await getProjectDataForCalculationsTestMode(projectId);

    // 2. Calculer tous les résultats
    const results = await calculateAllResults(data);

    // 3. Sauvegarder dans la base de données
    await saveProjectResults(projectId, results);
  } catch (error) {
    console.error(
      `❌ Erreur lors du calcul et de la sauvegarde des résultats pour le projet ${projectId}:`,
      error
    );
    throw error;
  }
};
