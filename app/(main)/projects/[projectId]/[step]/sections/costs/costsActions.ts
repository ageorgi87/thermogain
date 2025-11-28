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

  // Convert undefined values to 0 for Prisma (which doesn't accept undefined for Float fields)
  const prismaData = {
    cout_pac: validatedData.cout_pac ?? 0,
    cout_installation: validatedData.cout_installation ?? 0,
    cout_travaux_annexes: validatedData.cout_travaux_annexes ?? 0,
    cout_total: validatedData.cout_total ?? 0,
  }

  const couts = await prisma.projectCouts.upsert({
    where: { projectId },
    create: {
      ...prismaData,
      projectId,
    },
    update: prismaData,
  })

  if (project.currentStep === 5) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 6 },
    })
  }

  return couts
}
