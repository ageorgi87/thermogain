"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepLayout } from "@/app/(main)/projects/[projectId]/components/StepLayout"
import { ProjetPacFields } from "@/app/(main)/projects/[projectId]/projet-pac/components/ProjetPacFields"
import { saveHeatPumpProjectData } from "@/app/(main)/projects/[projectId]/projet-pac/actions/saveHeatPumpProjectData"
import { heatPumpProjectSchema, type HeatPumpProjectData } from "@/app/(main)/projects/[projectId]/projet-pac/actions/heatPumpProjectSchema"
import { updateProjectStep } from "@/lib/actions/projects/updateProjectStep"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"

interface ProjetPacStepClientProps {
  projectId: string
  initialData: Partial<HeatPumpProjectData>
  defaultPrices: {
    fioul: number
    gaz: number
    gpl: number
    bois: number
    electricite: number
  }
  typeChauffageActuel?: string
  prixElecKwhActuel?: number
  puissanceSouscriteActuelle?: number
  currentStepNumber: number
}

const STEP_INFO = {
  key: "projet-pac",
  title: "Projet de pompe à chaleur",
  description: "Caractéristiques de la PAC envisagée",
  explanation:
    "Ces informations permettent de calculer la consommation électrique de la pompe à chaleur, les coûts d'abonnement, et d'estimer les économies d'énergie par rapport à votre système actuel.",
}

export const ProjetPacStepClient = ({
  projectId,
  initialData,
  defaultPrices,
  typeChauffageActuel,
  prixElecKwhActuel,
  puissanceSouscriteActuelle,
  currentStepNumber,
}: ProjetPacStepClientProps) => {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<HeatPumpProjectData>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === STEP_INFO.key)
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1

  const handleChange = (name: keyof HeatPumpProjectData, value: any) => {
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
      const result = heatPumpProjectSchema.safeParse(formData)

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

      // Manual validation for water-based PACs
      const typePac = result.data.type_pac
      if (typePac === "Air/Eau" || typePac === "Eau/Eau") {
        if (!result.data.temperature_depart) {
          setErrors((prev) => ({
            ...prev,
            temperature_depart: "La température de départ est requise pour une PAC à eau",
          }))
          return
        }
        if (!result.data.emetteurs || result.data.emetteurs.length === 0) {
          setErrors((prev) => ({
            ...prev,
            emetteurs: "Au moins un émetteur est requis pour une PAC à eau",
          }))
          return
        }
      }

      await saveHeatPumpProjectData(projectId, result.data)
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
      <ProjetPacFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        currentElectricPower={puissanceSouscriteActuelle}
        defaultElectricityPrice={defaultPrices.electricite}
        prixElecKwhActuel={prixElecKwhActuel}
        typeChauffageActuel={typeChauffageActuel}
      />
    </StepLayout>
  )
}
