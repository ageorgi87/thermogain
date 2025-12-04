"use client";

import { use } from "react";
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper";
import { HousingFields } from "@/app/(main)/[projectId]/(step)/(content)/logement/components/HousingFields";
import { saveHousingData } from "@/app/(main)/[projectId]/(step)/(content)/logement/actions/saveHousingData";
import {
  housingSchema,
  type HousingData,
} from "@/app/(main)/[projectId]/(step)/(content)/logement/actions/housingSchema";
import { getLogementData } from "@/app/(main)/[projectId]/(step)/(content)/logement/queries/getLogementData";
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData";
import { STEP_INFO } from "@/app/(main)/[projectId]/(step)/(content)/logement/config/stepInfo";
import { useStepForm } from "@/app/(main)/[projectId]/(step)/lib/useStepForm";

export default function LogementStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const {
    formData,
    errors,
    isSubmitting,
    isLoading,
    stepIndex,
    isLastStep,
    handleChange,
    handleSubmit,
    handlePrevious,
  } = useStepForm({
    projectId,
    stepKey: STEP_INFO.key,
    schema: housingSchema,
    loadData: async ({ projectId }) => {
      const data = await getLogementData({ projectId });
      return data.logement || {};
    },
    saveData: async ({ projectId, data }) => {
      await saveHousingData({ projectId, data });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Chargement...
      </div>
    );
  }

  return (
    <StepWrapper
      title={STEP_INFO.title}
      description={STEP_INFO.description}
      stepNumber={stepIndex + 1}
      totalSteps={WIZARD_STEPS.length}
      explanation={STEP_INFO.explanation}
      isLastStep={isLastStep}
      isSubmitting={isSubmitting}
      onPrevious={handlePrevious}
      onNext={handleSubmit}
    >
      <HousingFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
      />
    </StepWrapper>
  );
}
