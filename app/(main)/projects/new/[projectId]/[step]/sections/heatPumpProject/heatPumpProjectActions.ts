"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { heatPumpProjectSchema, type HeatPumpProjectData } from "./heatPumpProjectSchema"

export async function saveHeatPumpProjectData(projectId: string, data: HeatPumpProjectData) {
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

  const validatedData = heatPumpProjectSchema.parse(data)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== user.id) {
    throw new Error("Projet non trouvé")
  }

  const projetPac = await prisma.projectProjetPac.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    } as any,
    update: validatedData as any,
  })

  if (project.currentStep === 4) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 5 },
    })
  }

  return projetPac
}
