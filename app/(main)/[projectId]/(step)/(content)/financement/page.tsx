"use client";

import { use, useState } from "react";
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper";
import { FinancementFields } from "@/app/(main)/[projectId]/(step)/(content)/financement/components/FinancementFields";
import { saveFinancingData } from "@/app/(main)/[projectId]/(step)/(content)/financement/actions/saveFinancingData/saveFinancingData";
import { financingSchema } from "@/app/(main)/[projectId]/(step)/(content)/financement/actions/saveFinancingData/saveFinancingDataSchema";
import { getFinancementData } from "@/app/(main)/[projectId]/(step)/(content)/financement/queries/getFinancementData";
import { calculateAndSaveResults } from "./lib/calculateAndSaveResults";
import { getStepInfo, getTotalSteps } from "@/config/wizardStepsData";
import { useStepForm } from "@/app/(main)/[projectId]/(step)/lib/useStepForm";

export default function FinancementStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const [totalCouts, setTotalCouts] = useState(0);
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

      setTotalCouts(data.couts?.cout_total || 0);
      setTotalAides(data.aides?.total_aides || 0);

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
      <FinancementFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        totalCouts={totalCouts}
        totalAides={totalAides}
      />
    </StepWrapper>
  );
}
