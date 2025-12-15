"use client"

import { use, useState } from "react"
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper"
import { EcsActuelFields } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/components/EcsActuelFields"
import { saveEcsActuelData } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/actions/saveEcsActuelData"
import {
  ecsActuelSchema,
  type EcsActuelData,
} from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/actions/ecsActuelSchema"
import { getCurrentEcsData } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/queries/getCurrentEcsData"
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
    schema: ecsActuelSchema,
    loadData: async ({ projectId }) => {
      const data = await getCurrentEcsData({ projectId })

      setNombreOccupants(data.logementInfo.nombreOccupants)
      setDefaultPrices(data.defaultPrices)

      if (data.ecs) {
        const {
          id,
          projectId: pid,
          createdAt,
          updatedAt,
          ...formFields
        } = data.ecs

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
      await saveEcsActuelData({ projectId, data, nombreOccupants })
    },
  })

  const handleNumberChange =
    (name: keyof EcsActuelData) =>
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
      <EcsActuelFields
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
