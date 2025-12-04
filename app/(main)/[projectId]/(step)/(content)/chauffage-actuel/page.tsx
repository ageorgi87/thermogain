"use client";

import { use, useState, useEffect } from "react";
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper";
import { ChauffageActuelFields } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/components/ChauffageActuelFields";
import { saveCurrentHeatingData } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/actions/saveCurrentHeatingData";
import { getDefaultEnergyPrices } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/lib/getDefaultEnergyPrices";
import type { DefaultEnergyPrices } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/types/defaultEnergyPrices";
import {
  currentHeatingSchema,
  type CurrentHeatingData,
} from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/actions/currentHeatingSchema";
import { getChauffageActuelData } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/queries/getChauffageActuelData";
import {
  getStepInfo,
  getTotalSteps,
} from "@/config/wizardStepsData";
import { useStepForm } from "@/app/(main)/[projectId]/(step)/lib/useStepForm";

export default function ChauffageActuelStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const STEP_INFO = getStepInfo("chauffage-actuel")!;

  const [defaultPrices, setDefaultPrices] = useState<DefaultEnergyPrices>({
    fioul: 0,
    gaz: 0,
    gpl: 0,
    bois: 0,
    electricite: 0,
  });

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
    schema: currentHeatingSchema,
    loadData: async ({ projectId }) => {
      const [data, prices] = await Promise.all([
        getChauffageActuelData({ projectId }),
        getDefaultEnergyPrices(),
      ]);

      setDefaultPrices(prices);

      if (data.chauffageActuel) {
        const {
          id,
          projectId: pid,
          createdAt,
          updatedAt,
          ...formFields
        } = data.chauffageActuel;
        return formFields;
      }
      return {};
    },
    saveData: async ({ projectId, data }) => {
      await saveCurrentHeatingData({ projectId, data });
    },
  });

  const handleNumberChange =
    (name: keyof CurrentHeatingData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
        handleChange(name, undefined);
      } else {
        const num = parseFloat(value);
        handleChange(name, isNaN(num) ? undefined : num);
      }
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
      <ChauffageActuelFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onNumberChange={handleNumberChange}
        defaultPrices={defaultPrices}
      />
    </StepWrapper>
  );
}
