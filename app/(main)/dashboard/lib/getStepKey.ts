import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"

/**
 * Retourne la clé de l'étape pour un currentStep donné (1-based)
 * @param currentStep - Le numéro d'étape actuel du projet (1-based)
 * @returns La clé de l'étape ou undefined si invalide
 */
export const getStepKey = (currentStep: number): string | undefined => {
  const index = currentStep - 1
  return WIZARD_STEPS[index]?.key
}
