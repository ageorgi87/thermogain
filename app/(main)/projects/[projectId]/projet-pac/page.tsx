import { notFound } from "next/navigation"
import { getProject } from "@/lib/actions/projects/getProject"
import { ProjetPacStepClient } from "./ProjetPacStepClient"
import { getDefaultEnergyPrices } from "../chauffage-actuel/actions/saveCurrentHeatingData"

export default async function ProjetPacStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    notFound()
  }

  const initialData = project.projetPac || {}
  const defaultPrices = await getDefaultEnergyPrices()

  // Données du chauffage actuel pour pré-remplissage
  const typeChauffage = project.chauffageActuel?.type_chauffage
  const prixElecKwhActuel = project.chauffageActuel?.prix_elec_kwh
  const puissanceSouscriteActuelle = project.chauffageActuel?.puissance_souscrite_actuelle

  return (
    <ProjetPacStepClient
      projectId={projectId}
      initialData={initialData}
      defaultPrices={defaultPrices}
      typeChauffageActuel={typeChauffage}
      prixElecKwhActuel={prixElecKwhActuel}
      puissanceSouscriteActuelle={puissanceSouscriteActuelle}
      currentStepNumber={project.currentStep || 1}
    />
  )
}
