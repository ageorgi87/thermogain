"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StepLayout } from "@/app/(main)/projects/[projectId]/components/StepLayout"
import { InformationsFields } from "@/app/(main)/projects/[projectId]/(step)/informations/components/InformationsFields"
import { saveInformationsData } from "@/app/(main)/projects/[projectId]/(step)/informations/actions/saveInformationsData"
import { informationsSchema, type InformationsData } from "@/app/(main)/projects/[projectId]/(step)/informations/actions/informationsSchema"
import { updateProjectStep } from "@/lib/actions/projects/updateProjectStep"
import { getProject } from "@/lib/actions/projects/getProject"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"
import { notFound } from "next/navigation"

const STEP_INFO = {
  key: "informations",
  title: "Informations du projet",
  description: "Nommez votre projet et renseignez les destinataires",
  explanation:
    "Le nom du projet vous permet de le retrouver facilement dans votre liste. Les adresses email recevront automatiquement le rapport de simulation une fois l'analyse terminée.",
}

export default function InformationsStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<InformationsData>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === STEP_INFO.key)
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1

  useEffect(() => {
    const loadProject = async () => {
      try {
        const project = await getProject(projectId)

        if (!project) {
          notFound()
          return
        }

        setFormData({
          project_name: project.name || "",
          recipient_emails: project.recipientEmails || [],
        })
      } catch (error) {
        console.error("❌ Erreur lors du chargement:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [projectId])

  const handleChange = (name: keyof InformationsData, value: any) => {
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
      const result = informationsSchema.safeParse(formData)

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

      await saveInformationsData(projectId, result.data)
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
    router.push("/projects")
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
      <InformationsFields formData={formData} errors={errors} onChange={handleChange} />
    </StepLayout>
  )
}
