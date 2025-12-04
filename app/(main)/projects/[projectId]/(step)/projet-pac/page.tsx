"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StepLayout } from "@/app/(main)/projects/[projectId]/components/StepLayout"
import { ProjetPacFields } from "@/app/(main)/projects/[projectId]/(step)/projet-pac/components/ProjetPacFields"
import { saveHeatPumpProjectData } from "@/app/(main)/projects/[projectId]/(step)/projet-pac/actions/saveHeatPumpProjectData"
import { heatPumpProjectSchema, type HeatPumpProjectData } from "@/app/(main)/projects/[projectId]/(step)/projet-pac/actions/heatPumpProjectSchema"
import { updateProjectStep } from "@/lib/actions/projects/updateProjectStep"
import { getProject } from "@/lib/actions/projects/getProject"
import { getDefaultEnergyPrices } from "@/app/(main)/projects/[projectId]/(step)/chauffage-actuel/actions/saveCurrentHeatingData"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"
import { notFound } from "next/navigation"

const STEP_INFO = {
  key: "projet-pac",
  title: "Projet de pompe à chaleur",
  description: "Caractéristiques de la PAC envisagée",
  explanation:
    "Ces informations permettent de calculer la consommation électrique de la pompe à chaleur, les coûts d'abonnement, et d'estimer les économies d'énergie par rapport à votre système actuel.",
}

export default function ProjetPacStepPage({
  params,
}: {
  params: { projectId: string }
}) {
  const projectId = params.projectId
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<HeatPumpProjectData>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [defaultPrices, setDefaultPrices] = useState({
    fioul: 0,
    gaz: 0,
    gpl: 0,
    bois: 0,
    electricite: 0,
  })
  const [typeChauffageActuel, setTypeChauffageActuel] = useState<string | undefined>()
  const [prixElecKwhActuel, setPrixElecKwhActuel] = useState<number | undefined>()
  const [puissanceSouscriteActuelle, setPuissanceSouscriteActuelle] = useState<number | undefined>()

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.key === STEP_INFO.key)
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1

  useEffect(() => {
    const loadProject = async () => {
      try {
        const [project, prices] = await Promise.all([
          getProject(projectId),
          getDefaultEnergyPrices(),
        ])

        if (!project) {
          notFound()
          return
        }

        setFormData(project.projetPac || {})
        setDefaultPrices(prices)
        setTypeChauffageActuel(project.chauffageActuel?.type_chauffage)
        setPrixElecKwhActuel(project.chauffageActuel?.prix_elec_kwh)
        setPuissanceSouscriteActuelle(project.chauffageActuel?.puissance_souscrite_actuelle)
      } catch (error) {
        console.error("❌ Erreur lors du chargement:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [projectId])

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
