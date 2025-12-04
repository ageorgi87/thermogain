import { notFound } from "next/navigation"
import { getProject } from "@/lib/actions/projects/getProject"
import { LogementStepClient } from "./LogementStepClient"

export default async function LogementStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    notFound()
  }

  const initialData = project.logement || {}

  return (
    <LogementStepClient
      projectId={projectId}
      initialData={initialData}
      currentStepNumber={project.currentStep || 1}
    />
  )
}
