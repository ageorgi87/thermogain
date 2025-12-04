"use client";

import { use, useState } from "react";
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper";
import { AidesFields } from "@/app/(main)/[projectId]/(step)/(content)/aides/components/AidesFields";
import { saveFinancialAidData } from "@/app/(main)/[projectId]/(step)/(content)/aides/actions/saveFinancialAidData";
import {
  financialAidSchema,
  type FinancialAidData,
} from "@/app/(main)/[projectId]/(step)/(content)/aides/actions/financialAidSchema";
import { getAidesData } from "@/app/(main)/[projectId]/(step)/(content)/aides/queries/getAidesData";
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData";
import { STEP_INFO } from "@/app/(main)/[projectId]/(step)/(content)/aides/config/stepInfo";
import { useStepForm } from "@/app/(main)/[projectId]/(step)/lib/useStepForm";

export default function AidesStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const [typePac, setTypePac] = useState<string | undefined>();
  const [anneeConstruction, setAnneeConstruction] = useState<
    number | undefined
  >();
  const [codePostal, setCodePostal] = useState<string | undefined>();
  const [surfaceHabitable, setSurfaceHabitable] = useState<
    number | undefined
  >();
  const [nombreOccupants, setNombreOccupants] = useState<number | undefined>();

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

      setTypePac(data.projetPac?.type_pac);
      setAnneeConstruction(data.logement?.annee_construction);
      setCodePostal(data.logement?.code_postal);
      setSurfaceHabitable(data.logement?.surface_habitable);
      setNombreOccupants(data.logement?.nombre_occupants);

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
      totalSteps={WIZARD_STEPS.length}
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
        typePac={typePac}
        anneeConstruction={anneeConstruction}
        codePostal={codePostal}
        surfaceHabitable={surfaceHabitable}
        nombreOccupants={nombreOccupants}
      />
    </StepWrapper>
  );
}
