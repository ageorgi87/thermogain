import { WIZARD_STEPS } from "./wizardStepsData"

/**
 * Retourne la clé de la première étape du wizard
 * @returns La clé de la première étape
 */
export const getFirstStepKey = (): string => {
  return WIZARD_STEPS[0].key
}
