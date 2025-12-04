import { notFound } from "next/navigation"
import { getProject } from "@/lib/actions/projects/getProject"
import { CoutsStepClient } from "./CoutsStepClient"

/**
 * Page Server Component pour l'étape "Coûts"
 * Charge les données depuis la DB et les passe au Client Component
 */
export default async function CoutsStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    notFound()
  }

  // Données de cette étape
  const initialData = project.couts || {
    cout_pac: undefined,
    cout_installation: undefined,
    cout_travaux_annexes: undefined,
    cout_total: 0,
  }

  return (
    <CoutsStepClient
      projectId={projectId}
      initialData={initialData}
      currentStepNumber={project.currentStep || 1}
    />
  )
}
