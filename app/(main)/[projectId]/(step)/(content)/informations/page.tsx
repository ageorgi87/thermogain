"use client";

import { use } from "react";
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper";
import { InformationsFields } from "@/app/(main)/[projectId]/(step)/(content)/informations/components/InformationsFields";
import { saveInformationsData } from "@/app/(main)/[projectId]/(step)/(content)/informations/actions/saveInformationsData";
import {
  informationsSchema,
  type InformationsData,
} from "@/app/(main)/[projectId]/(step)/(content)/informations/actions/informationsSchema";
import { getInformationsData } from "@/app/(main)/[projectId]/(step)/(content)/informations/queries/getInformationsData";
import {
  getStepInfo,
  getTotalSteps,
} from "@/config/wizardStepsData";
import { useStepForm } from "@/app/(main)/[projectId]/(step)/lib/useStepForm";

export default function InformationsStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const STEP_INFO = getStepInfo("informations")!;

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
    schema: informationsSchema,
    loadData: async ({ projectId }) => {
      const data = await getInformationsData({ projectId });
      return {
        project_name: data.name || "",
        recipient_emails: data.recipientEmails || [],
      };
    },
    saveData: async ({ projectId, data }) => {
      await saveInformationsData({ projectId, data });
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
      <InformationsFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
      />
    </StepWrapper>
  );
}
