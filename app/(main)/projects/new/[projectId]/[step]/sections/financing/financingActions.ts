"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { financingSchema, type FinancingData } from "./financingSchema"

export async function saveFinancingData(projectId: string, data: FinancingData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const validatedData = financingSchema.parse(data)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  const financement = await prisma.projectFinancement.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    } as any,
    update: validatedData as any,
  })

  if (project.currentStep === 7) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 8 },
    })
  }

  return financement
}
