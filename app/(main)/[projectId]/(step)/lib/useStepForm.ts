"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { getTotalSteps, getStepIndex } from "@/lib/wizardStepsData";
import { updateProjectStep } from "@/app/(main)/[projectId]/(step)/mutations/updateProjectStep";
import { notFound } from "next/navigation";
import {
  getNextStep,
  getPreviousStep,
} from "@/app/(main)/[projectId]/(step)/lib/getConditionalNavigation";

interface UseStepFormParams<T extends z.ZodType> {
  projectId: string;
  stepKey: string;
  schema: T;
  loadData: (params: { projectId: string }) => Promise<any>;
  saveData: (params: { projectId: string; data: z.infer<T> }) => Promise<void>;
}

/**
 * Hook personnalisé pour gérer la logique commune des formulaires d'étape
 * Abstrait : validation, navigation, sauvegarde, chargement des données
 */
export const useStepForm = <T extends z.ZodType>({
  projectId,
  stepKey,
  schema,
  loadData,
  saveData,
}: UseStepFormParams<T>) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<z.infer<T>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const stepIndex = getStepIndex(stepKey);
  const isLastStep = stepIndex === getTotalSteps() - 1;

  // Charger les données du projet
  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await loadData({ projectId });
        setFormData(data || {});
      } catch (error) {
        console.error("❌ Erreur lors du chargement:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  // Gérer le changement d'un champ
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    try {
      const result = schema.safeParse(formData);

      if (!result.success) {
        const errorMap: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errorMap[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(errorMap);
        setIsSubmitting(false); // Reset submitting state on validation error
        return;
      }

      await saveData({ projectId, data: result.data });
      await updateProjectStep(projectId, stepIndex + 2);

      // Utiliser la navigation conditionnelle
      const nextStepKey = await getNextStep(stepKey, projectId);
      if (nextStepKey) {
        router.push(`/${projectId}/${nextStepKey}`);
      } else {
        router.push(`/${projectId}/results`);
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

  // Naviguer vers l'étape précédente
  const handlePrevious = async () => {
    // Utiliser la navigation conditionnelle
    const previousStepKey = await getPreviousStep(stepKey, projectId);
    if (previousStepKey) {
      router.push(`/${projectId}/${previousStepKey}`);
    } else {
      router.push("/dashboard");
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    isLoading,
    stepIndex,
    isLastStep,
    handleChange,
    handleSubmit,
    handlePrevious,
  };
};
