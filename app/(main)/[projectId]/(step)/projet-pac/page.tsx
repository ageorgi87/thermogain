"use client"

import { use, useState } from "react"
import { StepWrapper } from "@/app/(main)/[projectId]/(step)/components/StepWrapper"
import { ProjetPacFields } from "@/app/(main)/[projectId]/(step)/projet-pac/components/ProjetPacFields"
import { saveHeatPumpProjectData } from "@/app/(main)/[projectId]/(step)/projet-pac/actions/saveHeatPumpProjectData"
import { heatPumpProjectSchema, type HeatPumpProjectData } from "@/app/(main)/[projectId]/(step)/projet-pac/actions/heatPumpProjectSchema"
import { getProjetPacData } from "@/app/(main)/[projectId]/(step)/projet-pac/queries/getProjetPacData"
import { getDefaultEnergyPrices } from "@/app/(main)/[projectId]/(step)/chauffage-actuel/lib/getDefaultEnergyPrices"
import { WIZARD_STEPS } from "@/lib/wizard/wizardStepsData"
import { STEP_INFO } from "@/app/(main)/[projectId]/(step)/projet-pac/config/stepInfo"
import { useStepForm } from "@/app/(main)/[projectId]/(step)/hooks/useStepForm"

export default function ProjetPacStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = use(params)

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
    schema: heatPumpProjectSchema,
    loadData: async ({ projectId }) => {
      const [data, prices] = await Promise.all([
        getProjetPacData({ projectId }),
        getDefaultEnergyPrices(),
      ])

      setDefaultPrices(prices)
      setTypeChauffageActuel(data.chauffageActuel?.type_chauffage)
      setPrixElecKwhActuel(data.chauffageActuel?.prix_elec_kwh ?? undefined)
      setPuissanceSouscriteActuelle(undefined)

      return data.projetPac || {}
    },
    saveData: async ({ projectId, data }) => {
      // Manual validation for water-based PACs
      const typePac = data.type_pac
      if (typePac === "Air/Eau" || typePac === "Eau/Eau") {
        if (!data.temperature_depart) {
          throw new Error("La température de départ est requise pour une PAC à eau")
        }
        if (!data.emetteurs || data.emetteurs.length === 0) {
          throw new Error("Au moins un émetteur est requis pour une PAC à eau")
        }
      }

      await saveHeatPumpProjectData({ projectId, data })
    },
  })

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  return (
    <StepWrapper
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
    </StepWrapper>
  )
}
