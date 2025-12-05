"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProjectData } from "@/types/projectData";

interface GetProjectDataForCalculationsParams {
  projectId: string;
}

/**
 * Query optimisée pour récupérer uniquement les données nécessaires aux calculs de rentabilité
 *
 * Exclut les données inutiles pour optimiser les performances:
 * - user (non utilisé dans les calculs)
 * - evolutions (deprecated depuis novembre 2024)
 * - project name et recipient emails (non utilisés dans les calculs)
 *
 * @param projectId - ID du projet
 * @returns Données formatées pour les calculs
 * @throws Error si le projet est introuvable, incomplet, ou non autorisé
 */
export const getProjectDataForCalculations = async ({
  projectId,
}: GetProjectDataForCalculationsParams): Promise<ProjectData> => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  // Query optimisée : uniquement les relations nécessaires aux calculs
  // (exclut user et evolutions pour réduire la charge)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      logement: true,
      chauffageActuel: true,
      projetPac: true,
      couts: true,
      aides: true,
      financement: true,
    },
  });

  if (!project || project.userId !== session.user.id) {
    throw new Error(`Projet ${projectId} introuvable ou non autorisé`);
  }

  // Vérifier que toutes les données nécessaires sont présentes
  if (
    !project.logement ||
    !project.chauffageActuel ||
    !project.projetPac ||
    !project.couts ||
    !project.aides
  ) {
    throw new Error(`Données incomplètes pour le projet ${projectId}`);
  }

  // Calculer le reste à charge (cout_total - total_aides)
  const reste_a_charge = project.couts.cout_total - project.aides.total_aides;

  // Mapper vers le format ProjectData utilisé par les calculs
  return {
    // Chauffage actuel
    type_chauffage: project.chauffageActuel.type_chauffage,
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
    puissance_souscrite_actuelle: project.projetPac.puissance_souscrite_actuelle,
    abonnement_gaz: project.chauffageActuel.abonnement_gaz ?? undefined,
    entretien_annuel: project.chauffageActuel.entretien_annuel,

    // Projet PAC
    type_pac: project.projetPac.type_pac,
    puissance_pac_kw: project.projetPac.puissance_pac_kw,
    cop_estime: project.projetPac.cop_estime,
    cop_ajuste: project.projetPac.cop_ajuste, // COP réel ajusté stocké en DB
    temperature_depart: project.projetPac.temperature_depart ?? 45, // Valeur par défaut
    emetteurs: project.projetPac.emetteurs ?? "Radiateurs basse température", // Valeur par défaut
    duree_vie_pac: project.projetPac.duree_vie_pac,
    puissance_souscrite_pac: project.projetPac.puissance_souscrite_pac,
    entretien_pac_annuel: project.projetPac.entretien_pac_annuel,
    prix_elec_pac: project.projetPac.prix_elec_pac ?? undefined,

    // Code postal pour ajustement climatique
    code_postal: project.logement.code_postal ?? undefined,

    // Coûts
    cout_total: project.couts.cout_total,

    // Aides - reste_a_charge calculé automatiquement
    reste_a_charge,

    // Financement
    mode_financement: project.financement?.mode_financement ?? undefined,
    montant_credit: project.financement?.montant_credit ?? undefined,
    taux_interet: project.financement?.taux_interet ?? undefined,
    duree_credit_mois: project.financement?.duree_credit_mois ?? undefined,
    apport_personnel: project.financement?.apport_personnel ?? undefined,
  };
};
