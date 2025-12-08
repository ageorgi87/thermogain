"use server";

import {
  getConditionalNextStepKey,
  getConditionalPreviousStepKey,
} from "@/app/(main)/[projectId]/(step)/lib/getConditionalStepNavigation";

/**
 * Server Action pour obtenir la prochaine étape en tenant compte des conditions
 */
export const getNextStep = async (
  currentStepKey: string,
  projectId: string
): Promise<string | undefined> => {
  return getConditionalNextStepKey(currentStepKey, projectId);
};

/**
 * Server Action pour obtenir l'étape précédente en tenant compte des conditions
 */
export const getPreviousStep = async (
  currentStepKey: string,
  projectId: string
): Promise<string | undefined> => {
  return getConditionalPreviousStepKey(currentStepKey, projectId);
};
