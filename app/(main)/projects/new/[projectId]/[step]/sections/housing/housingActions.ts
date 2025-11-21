"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { housingSchema, type HousingData } from "./housingSchema"

export async function saveHousingData(projectId: string, data: HousingData) {
  const session = await auth()

  if (!session?.user?.email) {
    throw new Error("Non autorisé")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  const validatedData = housingSchema.parse(data)

  // Check if heating project exists and belongs to user
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== user.id) {
    throw new Error("Projet non trouvé")
  }

  // Upsert logement data
  const logement = await prisma.projectLogement.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    } as any,
    update: validatedData as any,
  })

  // Update project's current step if needed
  if (project.currentStep === 1) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 2 },
    })
  }

  return logement
}
