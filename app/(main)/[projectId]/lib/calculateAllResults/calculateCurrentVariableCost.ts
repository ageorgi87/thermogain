import type { ProjectData } from "@/types/projectData"
import { getCurrentVariableCost as extractCurrentVariableCost } from "@/app/(main)/[projectId]/lib/calculateAllResults/helpers/energyDataExtractors"

/**
 * Calcule le coût VARIABLE annuel du chauffage actuel (énergie uniquement, sans coûts fixes)
 * @param data Données du projet
 * @returns Coût variable annuel en euros
 */
export const calculateCurrentVariableCost = (data: ProjectData): number => {
  return extractCurrentVariableCost(data)
}
