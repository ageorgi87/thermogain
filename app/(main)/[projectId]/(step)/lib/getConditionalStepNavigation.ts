import { shouldShowEcsStep } from "@/app/(main)/[projectId]/(step)/lib/shouldShowEcsStep";
import {
  getNextStepKey as getNextStepKeyBase,
  getPreviousStepKey as getPreviousStepKeyBase,
} from "@/lib/wizardStepsData";
import { WizardStepKey } from "@/types/wizardStepKey";

/**
 * Retourne la clé de l'étape suivante en tenant compte des étapes conditionnelles
 * Saute l'étape "ecs-actuel" si les conditions ne sont pas remplies
 */
export const getConditionalNextStepKey = async (
  currentStepKey: string,
  projectId: string
): Promise<string | undefined> => {
  const nextStepKey = getNextStepKeyBase(currentStepKey);

  if (!nextStepKey) {
    return undefined;
  }

  // Si la prochaine étape est "systeme-ecs-actuel", vérifier si elle doit être affichée
  if (nextStepKey === WizardStepKey.SYSTEME_ECS_ACTUEL) {
    const showEcs = await shouldShowEcsStep(projectId);
    if (!showEcs) {
      // Sauter l'étape ECS et passer à la suivante
      return getNextStepKeyBase(WizardStepKey.SYSTEME_ECS_ACTUEL);
    }
  }

  return nextStepKey;
};

/**
 * Retourne la clé de l'étape précédente en tenant compte des étapes conditionnelles
 * Saute l'étape "ecs-actuel" si les conditions ne sont pas remplies
 */
export const getConditionalPreviousStepKey = async (
  currentStepKey: string,
  projectId: string
): Promise<string | undefined> => {
  const previousStepKey = getPreviousStepKeyBase(currentStepKey);

  if (!previousStepKey) {
    return undefined;
  }

  // Si l'étape précédente est "systeme-ecs-actuel", vérifier si elle doit être affichée
  if (previousStepKey === WizardStepKey.SYSTEME_ECS_ACTUEL) {
    const showEcs = await shouldShowEcsStep(projectId);
    if (!showEcs) {
      // Sauter l'étape ECS et revenir à la précédente
      return getPreviousStepKeyBase(WizardStepKey.SYSTEME_ECS_ACTUEL);
    }
  }

  return previousStepKey;
};
