"use server";

import { getProjectDataForCalculations } from "@/app/(main)/[projectId]/(step)/(content)/financement/queries/getProjectDataForCalculations";
import { calculateAllResults } from "@/lib/calculateAllResults";
import { saveProjectResults } from "@/app/(main)/[projectId]/(step)/(content)/financement/actions/saveProjectResults/saveProjectResults";

/**
 * Calcule tous les résultats pour un projet et les sauvegarde en DB
 * Cette fonction doit être appelée après la validation de la dernière étape du formulaire
 *
 * @param projectId - ID du projet
 * @throws Error si le projet n'existe pas ou si les données sont incomplètes
 */
export const calculateAndSaveResults = async (
  projectId: string
): Promise<void> => {
  try {
    // 1. Récupérer les données nécessaires aux calculs (query optimisée)
    const projectData = await getProjectDataForCalculations({ projectId });

    if (!projectData) {
      throw new Error(`Projet ${projectId} introuvable`);
    }

    // 2. Calculer tous les résultats
    const results = await calculateAllResults(projectData);

    // 3. Sauvegarder en DB
    await saveProjectResults(projectId, results);
  } catch (error) {
    console.error(
      `❌ Erreur lors du calcul et de la sauvegarde des résultats pour le projet ${projectId}:`,
      error
    );
    throw error;
  }
};
