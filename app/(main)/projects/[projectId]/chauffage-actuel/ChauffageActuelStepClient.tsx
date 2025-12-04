"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepLayout } from "@/app/(main)/projects/[projectId]/components/StepLayout"
import { ChauffageActuelFields } from "@/app/(main)/projects/[projectId]/chauffage-actuel/components/ChauffageActuelFields"
import { saveCurrentHeatingData } from "@/app/(main)/projects/[projectId]/chauffage-actuel/actions/saveCurrentHeatingData"
import { currentHeatingSchema, type CurrentHeatingData } from "@/app/(main)/projects/[projectId]/chauffage-actuel/actions/currentHeatingSchema"
import { updateProjectStep } from "@/lib/actions/projects/updateProjectStep"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"

interface ChauffageActuelStepClientProps {
  projectId: string
  initialData: Partial<CurrentHeatingData>
  defaultPrices: {
    fioul: number
    gaz: number
    gpl: number
    bois: number
    electricite: number
  }
  currentStepNumber: number
}

const STEP_INFO = {
  key: "chauffage-actuel",
  title: "Chauffage actuel",
  description: "Votre système de chauffage existant",
  explanation:
    "Ces informations nous permettent d'évaluer votre consommation énergétique actuelle, son coût annuel, et le rendement de votre installation. Cette analyse servira de référence pour comparer les économies potentielles avec une pompe à chaleur.",
}

export const ChauffageActuelStepClient = ({
  projectId,
  initialData,
  defaultPrices,
  currentStepNumber,
}: ChauffageActuelStepClientProps) => {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<CurrentHeatingData>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === STEP_INFO.key)
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1

  const handleChange = (name: keyof CurrentHeatingData, value: any) => {
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
      const result = currentHeatingSchema.safeParse(formData)

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

      await saveCurrentHeatingData(projectId, result.data)
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
      <ChauffageActuelFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        defaultPrices={defaultPrices}
      />
    </StepLayout>
  )
}
