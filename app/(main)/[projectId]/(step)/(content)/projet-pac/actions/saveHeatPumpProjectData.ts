"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { heatPumpProjectSchema, type HeatPumpProjectData } from "./heatPumpProjectSchema"

interface SaveHeatPumpProjectDataParams {
  projectId: string
  data: HeatPumpProjectData
}

export const saveHeatPumpProjectData = async ({
  projectId,
  data,
}: SaveHeatPumpProjectDataParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const validatedData = heatPumpProjectSchema.parse(data)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== session.user.id) {
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
