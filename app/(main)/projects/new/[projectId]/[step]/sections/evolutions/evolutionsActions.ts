"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { evolutionsSchema, type EvolutionsData } from "./evolutionsSchema"

export async function saveEvolutionsData(projectId: string, data: EvolutionsData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const validatedData = evolutionsSchema.parse(data)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  const evolutions = await prisma.projectEvolutions.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    } as any,
    update: validatedData as any,
  })

  // Mark project as completed (final step)
  if (project.currentStep === 7) {
    await prisma.project.update({
      where: { id: projectId },
      data: { completed: true },
    })
  }

  return evolutions
}
