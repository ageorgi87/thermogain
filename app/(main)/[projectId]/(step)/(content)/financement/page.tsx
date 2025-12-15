"use client";

import { use, useState } from "react";
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper";
import { FinancementFields } from "@/app/(main)/[projectId]/(step)/(content)/financement/components/FinancementFields";
import { saveFinancingData } from "@/app/(main)/[projectId]/(step)/(content)/financement/actions/saveFinancingData/saveFinancingData";
import { financingSchema } from "@/app/(main)/[projectId]/(step)/(content)/financement/actions/saveFinancingData/saveFinancingDataSchema";
import { getFinancementData } from "@/app/(main)/[projectId]/(step)/(content)/financement/queries/getFinancementData";
import { calculateAndSaveResults } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/calculateAndSaveResults";
import { getStepInfo, getTotalSteps } from "@/lib/wizardStepsData";
import { useStepForm } from "@/app/(main)/[projectId]/(step)/lib/useStepForm";

export default function FinancementStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const [totalCosts, setTotalCosts] = useState(0);
  const [totalAides, setTotalAides] = useState(0);

  const STEP_INFO = getStepInfo("financement")!;

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
    schema: financingSchema,
    loadData: async ({ projectId }) => {
      const data = await getFinancementData({ projectId });

      setTotalCosts(data.costs?.totalCost || 0);
      setTotalAides(data.financialAid?.totalAid || 0);

      return data.financement || {};
    },
    saveData: async ({ projectId, data }) => {
      await saveFinancingData({ projectId, data });

      // Special handling for last step: trigger results calculation
      if (isLastStep) {
        await calculateAndSaveResults(projectId);
      }
    },
  });

  return (
    <StepWrapper
      title={STEP_INFO.title}
      description={STEP_INFO.description}
      stepNumber={stepIndex + 1}
      totalSteps={getTotalSteps()}
      explanation={STEP_INFO.explanation}
      isLastStep={isLastStep}
      isSubmitting={isSubmitting}
      isLoading={isLoading}
      onPrevious={handlePrevious}
      onNext={handleSubmit}
    >
      <FinancementFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        totalCouts={totalCosts}
        totalAides={totalAides}
      />
    </StepWrapper>
  );
}
