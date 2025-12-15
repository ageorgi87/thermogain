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
    (formData.cout_pac || 0) +
    (formData.cout_installation || 0) +
    (formData.cout_travaux_annexes || 0);

  // Synchronisation du total calculé avec formData
  useEffect(() => {
    if (formData.cout_total !== totalCost) {
      handleChange("cout_total", totalCost);
    }
  }, [totalCost, formData.cout_total]);

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
        heatPumpCost={formData.cout_pac}
        installationCost={formData.cout_installation}
        additionalWorkCost={formData.cout_travaux_annexes}
        totalCost={totalCost}
        errors={errors}
        onChange={handleFieldChange}
      />
    </StepWrapper>
  );
}
