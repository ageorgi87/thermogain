"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepLayout } from "@/app/(main)/projects/[projectId]/components/StepLayout"
import { CoutsFields } from "@/app/(main)/projects/[projectId]/couts/components/CoutsFields"
import { saveCostsData } from "@/app/(main)/projects/[projectId]/couts/actions/saveCostsData"
import { costsSchema, type CostsData } from "@/app/(main)/projects/[projectId]/couts/actions/costsSchema"
import { updateProjectStep } from "@/lib/actions/projects/updateProjectStep"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"

interface CoutsStepClientProps {
  projectId: string
  initialData: Partial<CostsData>
  currentStepNumber: number
}

const STEP_INFO = {
  key: "couts",
  title: "Coûts de l'installation",
  description: "Détaillez les différents coûts de votre projet",
  explanation:
    "Le détail des coûts (équipement, installation, travaux annexes) permet de calculer votre investissement total et d'évaluer la rentabilité de votre projet sur le long terme.",
}

/**
 * Client Component pour l'étape "Coûts"
 * Gère l'état du formulaire, la validation, et la navigation
 */
export const CoutsStepClient = ({
  projectId,
  initialData,
  currentStepNumber,
}: CoutsStepClientProps) => {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<CostsData>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === STEP_INFO.key)
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1

  const handleChange = (name: keyof CostsData, value: any) => {
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
      // Validation
      const result = costsSchema.safeParse(formData)

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

      // Sauvegarde en DB
      await saveCostsData(projectId, result.data)

      // Mise à jour de l'étape du projet
      await updateProjectStep(projectId, stepIndex + 2)

      // Navigation vers étape suivante
      if (stepIndex < WIZARD_STEPS.length - 1) {
        const nextStep = WIZARD_STEPS[stepIndex + 1]
        router.push(`/projects/${projectId}/${nextStep.key}`)
      } else {
        router.push(`/projects/${projectId}/results`)
      }
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error)
      alert(
        `Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : "Erreur inconnue"}`
      )
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
      <CoutsFields formData={formData} errors={errors} onChange={handleChange} />
    </StepLayout>
  )
}
