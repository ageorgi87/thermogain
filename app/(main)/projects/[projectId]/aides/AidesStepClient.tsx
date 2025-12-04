"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepLayout } from "@/app/(main)/projects/[projectId]/components/StepLayout"
import { AidesFields } from "@/app/(main)/projects/[projectId]/aides/components/AidesFields"
import { saveFinancialAidData } from "@/app/(main)/projects/[projectId]/aides/actions/saveFinancialAidData"
import { financialAidSchema, type FinancialAidData } from "@/app/(main)/projects/[projectId]/aides/actions/financialAidSchema"
import { updateProjectStep } from "@/lib/actions/projects/updateProjectStep"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"

interface AidesStepClientProps {
  projectId: string
  initialData: Partial<FinancialAidData>
  typePac?: string
  anneeConstruction?: number
  codePostal?: string
  surfaceHabitable?: number
  nombreOccupants?: number
  currentStepNumber: number
}

const STEP_INFO = {
  key: "aides",
  title: "Aides financières",
  description: "Calculez les aides dont vous pouvez bénéficier",
  explanation:
    "Les aides financières (MaPrimeRénov', CEE, etc.) peuvent considérablement réduire le coût d'installation de votre pompe à chaleur. Ces informations permettent d'estimer le montant des aides auxquelles vous êtes éligible.",
}

export const AidesStepClient = ({
  projectId,
  initialData,
  typePac,
  anneeConstruction,
  codePostal,
  surfaceHabitable,
  nombreOccupants,
  currentStepNumber,
}: AidesStepClientProps) => {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<FinancialAidData>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === STEP_INFO.key)
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1

  const handleChange = (name: keyof FinancialAidData, value: any) => {
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
      const result = financialAidSchema.safeParse(formData)

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

      await saveFinancialAidData(projectId, result.data)
      await updateProjectStep(projectId, stepIndex + 2)

      if (stepIndex < WIZARD_STEPS.length - 1) {
        const nextStep = WIZARD_STEPS[stepIndex + 1]
        router.push(`/projects/${projectId}/${nextStep.key}`)
      } else {
        router.push(`/projects/${projectId}/results`)
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
    </StepLayout>
  )
}
