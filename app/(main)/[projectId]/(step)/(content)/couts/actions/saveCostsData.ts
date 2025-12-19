"use server"

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess"
import { prisma } from "@/lib/prisma"
import { costsSchema, type CostsData } from "@/app/(main)/[projectId]/(step)/(content)/couts/actions/costsSchema"

interface SaveCostsDataParams {
  projectId: string
  data: CostsData
}

export const saveCostsData = async ({
  projectId,
  data,
}: SaveCostsDataParams) => {
  await verifyProjectAccess({ projectId })

  const validatedData = costsSchema.parse(data)

  // Get project to check current step
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { currentStep: true },
  })

  if (!project) {
    throw new Error("Projet non trouvé")
  }

  // Convert undefined values to 0 for Prisma (which doesn't accept undefined for Float fields)
  const prismaData = {
    heatPumpCost: validatedData.cout_pac ?? 0,
    installationCost: validatedData.cout_installation ?? 0,
    additionalWorkCost: validatedData.cout_travaux_annexes ?? 0,
    totalCost: validatedData.cout_total ?? 0,
  }

  const costs = await prisma.projectCosts.upsert({
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

  return costs
}
