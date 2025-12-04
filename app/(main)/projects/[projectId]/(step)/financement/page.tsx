"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StepLayout } from "@/app/(main)/projects/[projectId]/components/StepLayout"
import { FinancementFields } from "@/app/(main)/projects/[projectId]/(step)/financement/components/FinancementFields"
import { saveFinancingData } from "@/app/(main)/projects/[projectId]/(step)/financement/actions/saveFinancingData"
import { financingSchema, type FinancingData } from "@/app/(main)/projects/[projectId]/(step)/financement/actions/financingSchema"
import { updateProjectStep } from "@/lib/actions/projects/updateProjectStep"
import { getFinancementData } from "@/app/(main)/projects/[projectId]/(step)/financement/queries/getFinancementData"
import { calculateAndSaveResults } from "@/lib/actions/results/calculateAndSaveResults"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"
import { STEP_INFO } from "@/app/(main)/projects/[projectId]/(step)/financement/config/stepInfo"
import { notFound } from "next/navigation"

export default function FinancementStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<FinancingData>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [totalCouts, setTotalCouts] = useState(0)
  const [totalAides, setTotalAides] = useState(0)

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === STEP_INFO.key)
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1

  useEffect(() => {
    const loadProject = async () => {
      try {
        const data = await getFinancementData({ projectId })

        setFormData(data.financement || {})
        setTotalCouts(data.couts?.cout_total || 0)
        setTotalAides(data.aides?.total_aides || 0)
      } catch (error) {
        console.error("❌ Erreur lors du chargement:", error)
        notFound()
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [projectId])

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

      await saveFinancingData({ projectId, data: result.data })
      await updateProjectStep(projectId, stepIndex + 2)

      // Special handling for last step: trigger results calculation
      if (isLastStep) {
        await calculateAndSaveResults(projectId)
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
