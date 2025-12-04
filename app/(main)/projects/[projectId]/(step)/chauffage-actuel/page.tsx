"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepLayout } from "@/app/(main)/projects/[projectId]/components/StepLayout";
import { ChauffageActuelFields } from "@/app/(main)/projects/[projectId]/(step)/chauffage-actuel/components/ChauffageActuelFields";
import { saveCurrentHeatingData } from "@/app/(main)/projects/[projectId]/(step)/chauffage-actuel/actions/saveCurrentHeatingData";
import { getDefaultEnergyPrices } from "@/app/(main)/projects/[projectId]/(step)/chauffage-actuel/lib/getDefaultEnergyPrices";
import type { DefaultEnergyPrices } from "@/app/(main)/projects/[projectId]/(step)/chauffage-actuel/types/defaultEnergyPrices";
import {
  currentHeatingSchema,
  type CurrentHeatingData,
} from "@/app/(main)/projects/[projectId]/(step)/chauffage-actuel/actions/currentHeatingSchema";
import { updateProjectStep } from "@/lib/actions/projects/updateProjectStep";
import { getChauffageActuelData } from "@/app/(main)/projects/[projectId]/(step)/chauffage-actuel/queries/getChauffageActuelData";
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData";
import { notFound } from "next/navigation";
import { STEP_INFO } from "@/app/(main)/projects/[projectId]/(step)/chauffage-actuel/config/stepInfo";

export default function ChauffageActuelStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<CurrentHeatingData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultPrices, setDefaultPrices] = useState<DefaultEnergyPrices>({
    fioul: 0,
    gaz: 0,
    gpl: 0,
    bois: 0,
    electricite: 0,
  });

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === STEP_INFO.key);
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;

  useEffect(() => {
    const loadProject = async () => {
      try {
        const [data, prices] = await Promise.all([
          getChauffageActuelData({ projectId }),
          getDefaultEnergyPrices(),
        ]);

        if (data.chauffageActuel) {
          const { id, projectId, createdAt, updatedAt, ...formFields } = data.chauffageActuel;
          setFormData(formFields as Partial<CurrentHeatingData>);
        }
        setDefaultPrices(prices);
      } catch (error) {
        console.error("❌ Erreur lors du chargement:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleChange = (name: keyof CurrentHeatingData, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = currentHeatingSchema.safeParse(formData);

      if (!result.success) {
        const errorMap: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errorMap[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(errorMap);
        return;
      }

      await saveCurrentHeatingData({ projectId, data: result.data });
      await updateProjectStep(projectId, stepIndex + 2);

      if (stepIndex < WIZARD_STEPS.length - 1) {
        const nextStep = WIZARD_STEPS[stepIndex + 1];
        router.push(`/projects/${projectId}/${nextStep.key}`);
      } else {
        router.push(`/projects/${projectId}/results`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error);
      alert(
        `Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : "Erreur inconnue"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (stepIndex > 0) {
      const previousStep = WIZARD_STEPS[stepIndex - 1];
      router.push(`/projects/${projectId}/${previousStep.key}`);
    } else {
      router.push("/projects");
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
    <StepLayout
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
      <ChauffageActuelFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onNumberChange={handleNumberChange}
        defaultPrices={defaultPrices}
      />
    </StepLayout>
  );
}
