"use client"

import { use, useState } from "react"
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper"
import { CurrentDhwFields } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/components/CurrentDhwFields"
import { saveCurrentDhwData } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/actions/saveCurrentDhwData"
import {
  currentDhwSchema,
  type CurrentDhwData,
} from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/actions/currentDhwSchema"
import { getCurrentDhwData } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/queries/getCurrentDhwData"
import { getStepInfo, getTotalSteps } from "@/lib/wizardStepsData"
import { useStepForm } from "@/app/(main)/[projectId]/(step)/lib/useStepForm"

export default function EcsActuelStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)

  const STEP_INFO = getStepInfo("systeme-ecs-actuel")!

  const [nombreOccupants, setNombreOccupants] = useState<number | null>(null)
  const [defaultPrices, setDefaultPrices] = useState({
    electricite: 0,
    gaz: 0,
  })

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
    schema: currentDhwSchema,
    loadData: async ({ projectId }) => {
      const data = await getCurrentDhwData({ projectId })

      setNombreOccupants(data.logementInfo.nombreOccupants)
      setDefaultPrices(data.defaultPrices)

      if (data.dhw) {
        const {
          id,
          projectId: pid,
          createdAt,
          updatedAt,
          ...formFields
        } = data.dhw

        // Convertir tous les null en undefined pour la validation Zod
        const cleanedFields = Object.fromEntries(
          Object.entries(formFields).map(([key, value]) => [
            key,
            value === null ? undefined : value,
          ])
        )

        return cleanedFields
      }
      return {}
    },
    saveData: async ({ projectId, data }) => {
      await saveCurrentDhwData({ projectId, data, nombreOccupants })
    },
  })

  const handleNumberChange =
    (name: keyof CurrentDhwData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value === "") {
        handleChange(name, undefined)
      } else {
        const num = parseFloat(value)
        handleChange(name, isNaN(num) ? undefined : num)
      }
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
      isLoading={isLoading}
      onPrevious={handlePrevious}
      onNext={handleSubmit}
    >
      <CurrentDhwFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onNumberChange={handleNumberChange}
        nombreOccupants={nombreOccupants}
        defaultPrices={defaultPrices}
      />
    </StepWrapper>
  )
}
