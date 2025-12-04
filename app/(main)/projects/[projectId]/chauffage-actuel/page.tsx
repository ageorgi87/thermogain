import { notFound } from "next/navigation"
import { getProject } from "@/lib/actions/projects/getProject"
import { ChauffageActuelStepClient } from "./ChauffageActuelStepClient"
import { getDefaultEnergyPrices } from "./actions/saveCurrentHeatingData"

export default async function ChauffageActuelStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    notFound()
  }

  const initialData = project.chauffageActuel || {}
  const defaultPrices = await getDefaultEnergyPrices()

  return (
    <ChauffageActuelStepClient
      projectId={projectId}
      initialData={initialData}
      defaultPrices={defaultPrices}
      currentStepNumber={project.currentStep || 1}
    />
  )
}
