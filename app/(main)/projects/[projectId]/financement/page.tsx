import { notFound } from "next/navigation"
import { getProject } from "@/lib/actions/projects/getProject"
import { FinancementStepClient } from "./FinancementStepClient"
import { calculateAndSaveResults } from "@/lib/actions/results/calculateAndSaveResults"

export default async function FinancementStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    notFound()
  }

  const initialData = project.financement || {}

  // Données des coûts et aides pour calculs
  const totalCouts = project.couts?.cout_total || 0
  const totalAides = project.aides?.total_aides || 0

  return (
    <FinancementStepClient
      projectId={projectId}
      initialData={initialData}
      totalCouts={totalCouts}
      totalAides={totalAides}
      currentStepNumber={project.currentStep || 1}
      onFinalSubmit={async () => {
        "use server"
        await calculateAndSaveResults(projectId)
      }}
    />
  )
}
