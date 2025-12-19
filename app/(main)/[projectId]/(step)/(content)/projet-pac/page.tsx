"use client";

import { use, useState } from "react";
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper";
import { HeatPumpProjectFields } from "@/app/(main)/[projectId]/(step)/(content)/projet-pac/components/HeatPumpProjectFields";
import { saveHeatPumpProjectData } from "@/app/(main)/[projectId]/(step)/(content)/projet-pac/actions/saveHeatPumpProjectData";
import {
  heatPumpProjectSchema,
  type HeatPumpProjectData,
} from "@/app/(main)/[projectId]/(step)/(content)/projet-pac/actions/heatPumpProjectSchema";
import { getHeatPumpProjectData } from "@/app/(main)/[projectId]/(step)/(content)/projet-pac/queries/getHeatPumpProjectData";
import { getDefaultEnergyPrices } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/lib/getDefaultEnergyPrices";
import { getStepInfo, getTotalSteps } from "@/lib/wizardStepsData";
import { useStepForm } from "@/app/(main)/[projectId]/(step)/lib/useStepForm";
import { PacType } from "@/types/pacType";

export default function ProjetPacStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const STEP_INFO = getStepInfo("projet-pac")!;

  const [defaultPrices, setDefaultPrices] = useState({
    fioul: 0,
    gaz: 0,
    gpl: 0,
    bois: 0,
    electricite: 0,
  });
  const [currentHeatingType, setCurrentHeatingType] = useState<
    string | undefined
  >();
  const [currentElectricityPricePerKwh, setCurrentElectricityPricePerKwh] = useState<
    number | undefined
  >();
  const [currentSubscribedPower, setCurrentSubscribedPower] = useState<
    number | undefined
  >();

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
    schema: heatPumpProjectSchema,
    loadData: async ({ projectId }) => {
      const [data, prices] = await Promise.all([
        getHeatPumpProjectData({ projectId }),
        getDefaultEnergyPrices(),
      ]);

      setDefaultPrices(prices);
      setCurrentHeatingType(data.currentHeating?.heatingType);
      setCurrentElectricityPricePerKwh(data.currentHeating?.electricityPricePerKwh ?? undefined);
      setCurrentSubscribedPower(undefined);

      return data.heatPump || {};
    },
    saveData: async ({ projectId, data }) => {
      // Manual validation for water-based PACs
      const heatPumpType = data.heatPumpType;
      if (heatPumpType === PacType.AIR_EAU || heatPumpType === PacType.EAU_EAU) {
        if (!data.emitters) {
          throw new Error("Le type d'émetteurs est requis pour une PAC hydraulique");
        }
      }

      await saveHeatPumpProjectData({ projectId, data });
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
      <HeatPumpProjectFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        currentElectricPower={currentSubscribedPower}
        defaultElectricityPrice={defaultPrices.electricite}
        currentElectricityPricePerKwh={currentElectricityPricePerKwh}
        currentHeatingType={currentHeatingType}
      />
    </StepWrapper>
  );
}
