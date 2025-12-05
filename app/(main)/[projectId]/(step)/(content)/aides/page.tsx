"use client";

import { use } from "react";
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper";
import { AidesFields } from "@/app/(main)/[projectId]/(step)/(content)/aides/components/AidesFields";
import { saveFinancialAidData } from "@/app/(main)/[projectId]/(step)/(content)/aides/actions/saveFinancialAidData";
import {
  financialAidSchema,
  type FinancialAidData,
} from "@/app/(main)/[projectId]/(step)/(content)/aides/actions/financialAidSchema";
import { getAidesData } from "@/app/(main)/[projectId]/(step)/(content)/aides/queries/getAidesData";
import { getStepInfo, getTotalSteps } from "@/lib/wizardStepsData";
import { useStepForm } from "@/app/(main)/[projectId]/(step)/lib/useStepForm";

export default function AidesStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const STEP_INFO = getStepInfo("aides")!;

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
    schema: financialAidSchema,
    loadData: async ({ projectId }) => {
      const data = await getAidesData({ projectId });
      return data.aides || {};
    },
    saveData: async ({ projectId, data }) => {
      await saveFinancialAidData({ projectId, data });
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
      totalSteps={getTotalSteps()}
      explanation={STEP_INFO.explanation}
      isLastStep={isLastStep}
      isSubmitting={isSubmitting}
      onPrevious={handlePrevious}
      onNext={handleSubmit}
    >
      <AidesFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        projectId={projectId}
      />
    </StepWrapper>
  );
}
