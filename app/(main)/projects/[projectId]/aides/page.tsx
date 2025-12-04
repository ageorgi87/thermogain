import { notFound } from "next/navigation"
import { getProject } from "@/lib/actions/projects/getProject"
import { AidesStepClient } from "./AidesStepClient"

export default async function AidesStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    notFound()
  }

  const initialData = project.aides || {}

  // Données des autres étapes pour les calculateurs d'aides
  const typePac = project.projetPac?.type_pac
  const anneeConstruction = project.logement?.annee_construction
  const codePostal = project.logement?.code_postal
  const surfaceHabitable = project.logement?.surface_habitable
  const nombreOccupants = project.logement?.nombre_occupants

  return (
    <AidesStepClient
      projectId={projectId}
      initialData={initialData}
      typePac={typePac}
      anneeConstruction={anneeConstruction}
      codePostal={codePostal}
      surfaceHabitable={surfaceHabitable}
      nombreOccupants={nombreOccupants}
      currentStepNumber={project.currentStep || 1}
    />
  )
}
