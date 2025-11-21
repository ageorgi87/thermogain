"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function updateProjectStep(projectId: string, stepNumber: number) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  // Only update if the new step is greater than current step
  if (stepNumber > project.currentStep) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: stepNumber },
    })
  }
}
