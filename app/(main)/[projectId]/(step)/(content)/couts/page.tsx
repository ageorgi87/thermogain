"use client";

import { use, useEffect } from "react";
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper";
import { CostsFieldsView } from "@/app/(main)/[projectId]/(step)/(content)/couts/components/CoutsFieldsView";
import { saveCostsData } from "@/app/(main)/[projectId]/(step)/(content)/couts/actions/saveCostsData";
import {
  costsSchema,
  type CostsData,
} from "@/app/(main)/[projectId]/(step)/(content)/couts/actions/costsSchema";
import { getCoutsData } from "@/app/(main)/[projectId]/(step)/(content)/couts/queries/getCoutsData";
import {
  getStepInfo,
  getTotalSteps,
} from "@/config/wizardStepsData";
import { useStepForm } from "@/app/(main)/[projectId]/(step)/lib/useStepForm";

export default function CoutsStepPage({
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
      const data = await getCoutsData({ projectId });
      return data.couts || {};
    },
    saveData: async ({ projectId, data }) => {
      await saveCostsData({ projectId, data });
    },
  });

  // Calcul du total
  const coutTotal =
    (formData.cout_pac || 0) +
    (formData.cout_installation || 0) +
    (formData.cout_travaux_annexes || 0);

  // Synchronisation du total calculé avec formData
  useEffect(() => {
    if (formData.cout_total !== coutTotal) {
      handleChange("cout_total", coutTotal);
    }
  }, [coutTotal, formData.cout_total]);

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
      <CostsFieldsView
        coutPac={formData.cout_pac}
        coutInstallation={formData.cout_installation}
        coutTravauxAnnexes={formData.cout_travaux_annexes}
        coutTotal={coutTotal}
        errors={errors}
        onChange={handleFieldChange}
      />
    </StepWrapper>
  );
}
