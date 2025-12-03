import { WIZARD_STEPS } from "./wizardStepsData"

/**
 * Retourne le nombre total d'étapes du wizard
 */
export const getTotalSteps = (): number => {
  return WIZARD_STEPS.length
}
