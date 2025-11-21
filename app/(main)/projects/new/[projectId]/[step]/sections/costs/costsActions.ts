"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { costsSchema, type CostsData } from "./costsSchema"

export async function saveCostsData(projectId: string, data: CostsData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const validatedData = costsSchema.parse(data)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  const couts = await prisma.projectCouts.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    } as any,
    update: validatedData as any,
  })

  if (project.currentStep === 5) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 6 },
    })
  }

  return couts
}
