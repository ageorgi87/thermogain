"use server"

import { getProjectData } from "@/lib/actions/projects/getProjectData"
import { calculateAllResults } from "@/app/(main)/[projectId]/calculations"
import { saveProjectResults } from "./saveProjectResults"

/**
 * Calcule tous les résultats pour un projet et les sauvegarde en DB
 * Cette fonction doit être appelée après la validation de la dernière étape du formulaire
 *
 * @param projectId - ID du projet
 * @throws Error si le projet n'existe pas ou si les données sont incomplètes
 */
export const calculateAndSaveResults = async (projectId: string): Promise<void> => {
  try {
    console.log(`🔄 Calcul et sauvegarde des résultats pour le projet ${projectId}...`)

    // 1. Récupérer toutes les données du projet
    const projectData = await getProjectData(projectId)

    if (!projectData) {
      throw new Error(`Projet ${projectId} introuvable`)
    }

    // 2. Calculer tous les résultats
    const results = await calculateAllResults(projectData)

    // 3. Sauvegarder en DB
    await saveProjectResults(projectId, results)

    console.log(`✅ Résultats calculés et sauvegardés pour le projet ${projectId}`)
  } catch (error) {
    console.error(`❌ Erreur lors du calcul et de la sauvegarde des résultats pour le projet ${projectId}:`, error)
    throw error
  }
}
