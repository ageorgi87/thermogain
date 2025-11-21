"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { currentHeatingSchema, type CurrentHeatingData } from "./currentHeatingSchema"

export async function saveCurrentHeatingData(projectId: string, data: CurrentHeatingData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const validatedData = currentHeatingSchema.parse(data)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  const chauffageActuel = await prisma.projectChauffageActuel.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    } as any,
    update: validatedData as any,
  })

  if (project.currentStep === 2) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 3 },
    })
  }

  return chauffageActuel
}
