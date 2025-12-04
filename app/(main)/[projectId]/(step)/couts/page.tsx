"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StepLayout } from "@/app/(main)/[projectId]/components/StepLayout"
import { CostsFieldsView } from "@/app/(main)/[projectId]/(step)/couts/components/CoutsFieldsView"
import { saveCostsData } from "@/app/(main)/[projectId]/(step)/couts/actions/saveCostsData"
import { costsSchema, type CostsData } from "@/app/(main)/[projectId]/(step)/couts/actions/costsSchema"
import { updateProjectStep } from "@/lib/actions/projects/updateProjectStep"
import { getCoutsData } from "@/app/(main)/[projectId]/(step)/couts/queries/getCoutsData"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"
import { STEP_INFO } from "@/app/(main)/[projectId]/(step)/couts/config/stepInfo"
import { notFound } from "next/navigation"

export default function CoutsStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<CostsData>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === STEP_INFO.key)
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1

  // Calcul du total
  const coutTotal =
    (formData.cout_pac || 0) +
    (formData.cout_installation || 0) +
    (formData.cout_travaux_annexes || 0)

  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await getCoutsData({ projectId })

        setFormData(data.couts || {
          cout_pac: undefined,
          cout_installation: undefined,
          cout_travaux_annexes: undefined,
          cout_total: 0,
        })
      } catch (error) {
        console.error("❌ Erreur lors du chargement:", error)
        notFound()
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [projectId])

  // Synchronisation du total calculé avec formData
  useEffect(() => {
    if (formData.cout_total !== coutTotal) {
      setFormData((prev) => ({ ...prev, cout_total: coutTotal }))
    }
  }, [coutTotal, formData.cout_total])

  const handleFieldChange = ({ field, value }: { field: keyof CostsData; value: string }) => {
    const parsedValue = value === "" ? undefined : parseFloat(value)
    setFormData((prev) => ({ ...prev, [field]: parsedValue }))
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
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

      await saveCostsData({ projectId, data: result.data })
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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
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
      <CostsFieldsView
        coutPac={formData.cout_pac}
        coutInstallation={formData.cout_installation}
        coutTravauxAnnexes={formData.cout_travaux_annexes}
        coutTotal={coutTotal}
        errors={errors}
        onChange={handleFieldChange}
      />
    </StepLayout>
  )
}
