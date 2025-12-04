"use client"

import { use } from "react"
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper"
import { InformationsFields } from "@/app/(main)/[projectId]/(step)/informations/components/InformationsFields"
import { saveInformationsData } from "@/app/(main)/[projectId]/(step)/informations/actions/saveInformationsData"
import { informationsSchema, type InformationsData } from "@/app/(main)/[projectId]/(step)/informations/actions/informationsSchema"
import { getInformationsData } from "@/app/(main)/[projectId]/(step)/informations/queries/getInformationsData"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"
import { STEP_INFO } from "@/app/(main)/[projectId]/(step)/informations/config/stepInfo"
import { useStepForm } from "@/app/(main)/[projectId]/(step)/hooks/useStepForm"

export default function InformationsStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)

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
      const data = await getInformationsData({ projectId })
      return {
        project_name: data.name || "",
        recipient_emails: data.recipientEmails || [],
      }
    },
    saveData: async ({ projectId, data }) => {
      await saveInformationsData({ projectId, data })
    },
  })

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
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
      <InformationsFields formData={formData} errors={errors} onChange={handleChange} />
    </StepWrapper>
  )
}
