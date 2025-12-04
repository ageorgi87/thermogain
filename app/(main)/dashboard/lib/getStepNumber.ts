import { getTotalSteps } from "@/lib/wizard/getTotalSteps"

/**
 * Retourne le numéro d'étape (1-based) pour un currentStep donné (1-based)
 * @param currentStep - Le numéro d'étape actuel du projet (1-based)
 * @returns Le numéro d'étape à afficher (1-based)
 */
export const getStepNumber = (currentStep: number): number => {
  return Math.min(currentStep, getTotalSteps())
}
