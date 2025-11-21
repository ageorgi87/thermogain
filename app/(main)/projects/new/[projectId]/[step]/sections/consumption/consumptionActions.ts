"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { consumptionSchema, type ConsumptionData } from "./consumptionSchema"

export async function saveConsumptionData(projectId: string, data: ConsumptionData) {
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

  const validatedData = consumptionSchema.parse(data)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== user.id) {
    throw new Error("Projet non trouvé")
  }

  const consommation = await prisma.projectConsommation.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    } as any,
    update: validatedData as any,
  })

  if (project.currentStep === 3) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 4 },
    })
  }

  return consommation
}
