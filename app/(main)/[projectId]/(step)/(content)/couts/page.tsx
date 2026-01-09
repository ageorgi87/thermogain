"use client";

import { use, useEffect } from "react";
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper";
import { CostsFieldsView } from "@/app/(main)/[projectId]/(step)/(content)/couts/components/CostsFieldsView";
import { saveCostsData } from "@/app/(main)/[projectId]/(step)/(content)/couts/actions/saveCostsData";
import {
  costsSchema,
  type CostsData,
} from "@/app/(main)/[projectId]/(step)/(content)/couts/actions/costsSchema";
import { getCostsData } from "@/app/(main)/[projectId]/(step)/(content)/couts/queries/getCostsData";
import { getStepInfo, getTotalSteps } from "@/lib/wizardStepsData";
import { useStepForm } from "@/app/(main)/[projectId]/(step)/lib/useStepForm";

export default function CostsStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const STEP_INFO = getStepInfo("couts")!;

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
    schema: costsSchema,
    loadData: async ({ projectId }) => {
      const data = await getCostsData({ projectId });
      return data.costs || {};
    },
    saveData: async ({ projectId, data }) => {
      await saveCostsData({ projectId, data });
    },
  });

  // Calcul du total
  const totalCost =
    (formData.heatPumpCost || 0) +
    (formData.installationCost || 0) +
    (formData.additionalWorkCost || 0);

  // Synchronisation du total calculé avec formData
  useEffect(() => {
    if (formData.totalCost !== totalCost) {
      handleChange("totalCost", totalCost);
    }
  }, [totalCost, formData.totalCost]);

  const handleFieldChange = ({
    field,
    value,
  }: {
    field: keyof CostsData;
    value: string;
  }) => {
    const parsedValue = value === "" ? undefined : parseFloat(value);
    handleChange(field, parsedValue);
  };

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
      <CostsFieldsView
        heatPumpCost={formData.heatPumpCost}
        installationCost={formData.installationCost}
        additionalWorkCost={formData.additionalWorkCost}
        totalCost={totalCost}
        errors={errors}
        onChange={handleFieldChange}
      />
    </StepWrapper>
  );
}
