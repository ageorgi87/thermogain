"use server";

import type { ProjectDataForAides } from "@/app/(main)/[projectId]/(step)/(content)/aides/types/types";
import type { CalculateAidesResult } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/calculateAides/types";

/**
 * Calcule les aides pour une PAC Géothermique (Eau/Eau) via l'API Mes Aides Réno
 *
 * IMPORTANT: Cette fonction est temporairement désactivée car l'API Mes Aides Réno
 * ne semble pas supporter les PAC géothermiques/eau-eau malgré la documentation.
 *
 * L'API rejette les requêtes avec "gestes.chauffage.PAC.géothermique" avec l'erreur:
 * "La référence 'gestes.chauffage.PAC.géothermique.montant' est introuvable"
 *
 * TODO: Contacter l'équipe Mes Aides Réno (contact@mesaidesreno.fr) pour clarifier
 * le support des PAC géothermiques et la nomenclature correcte.
 *
 * @param projectData - Données brutes du projet depuis la DB
 * @returns Never - Lance toujours une erreur
 * @throws Error indiquant que les PAC géothermiques ne sont pas supportées
 */
export const calculateAidesGeothermique = async (
  projectData: ProjectDataForAides
): Promise<CalculateAidesResult> => {
  throw new Error(
    "Les PAC géothermiques (Eau/Eau) ne sont pas encore supportées par l'API Mes Aides Réno. " +
      "Veuillez choisir une PAC Air/Eau ou Air/Air pour calculer les aides disponibles."
  );
};
