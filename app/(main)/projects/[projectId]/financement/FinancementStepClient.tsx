"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepLayout } from "@/app/(main)/projects/[projectId]/components/StepLayout"
import { FinancementFields } from "@/app/(main)/projects/[projectId]/financement/components/FinancementFields"
import { saveFinancingData } from "@/app/(main)/projects/[projectId]/financement/actions/saveFinancingData"
import { financingSchema, type FinancingData } from "@/app/(main)/projects/[projectId]/financement/actions/financingSchema"
import { updateProjectStep } from "@/lib/actions/projects/updateProjectStep"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"

interface FinancementStepClientProps {
  projectId: string
  initialData: Partial<FinancingData>
  totalCouts: number
  totalAides: number
  currentStepNumber: number
  onFinalSubmit: () => Promise<void>
}

const STEP_INFO = {
  key: "financement",
  title: "Plan de financement",
  description: "Mode de financement et options de paiement",
  explanation:
    "Le plan de financement vous permet de définir comment vous allez financer l'installation de votre pompe à chaleur. Cela affecte les calculs de retour sur investissement et les projections financières à long terme.",
}

export const FinancementStepClient = ({
  projectId,
  initialData,
  totalCouts,
  totalAides,
  currentStepNumber,
  onFinalSubmit,
}: FinancementStepClientProps) => {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<FinancingData>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === STEP_INFO.key)
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1

  const handleChange = (name: keyof FinancingData, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = financingSchema.safeParse(formData)

      if (!result.success) {
        const errorMap: Record<string, string> = {}
        result.error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errorMap[issue.path[0].toString()] = issue.message
          }
        })
        setErrors(errorMap)
        return
      }

      await saveFinancingData(projectId, result.data)
      await updateProjectStep(projectId, stepIndex + 2)

      // Special handling for last step: trigger results calculation
      if (isLastStep) {
        await onFinalSubmit()
        router.push(`/projects/${projectId}/results`)
      } else {
        const nextStep = WIZARD_STEPS[stepIndex + 1]
        router.push(`/projects/${projectId}/${nextStep.key}`)
      }
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error)
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrevious = () => {
    if (stepIndex > 0) {
      const previousStep = WIZARD_STEPS[stepIndex - 1]
      router.push(`/projects/${projectId}/${previousStep.key}`)
    } else {
      router.push("/projects")
    }
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
      <FinancementFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        totalCouts={totalCouts}
        totalAides={totalAides}
      />
    </StepLayout>
  )
}
