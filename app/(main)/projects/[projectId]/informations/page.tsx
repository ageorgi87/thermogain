import { notFound } from "next/navigation"
import { getProject } from "@/lib/actions/projects/getProject"
import { InformationsStepClient } from "./InformationsStepClient"

export default async function InformationsStepPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    notFound()
  }

  const initialData = {
    project_name: project.name || "",
    recipient_emails: project.recipientEmails || [],
  }

  return (
    <InformationsStepClient
      projectId={projectId}
      initialData={initialData}
      currentStepNumber={project.currentStep || 1}
    />
  )
}
