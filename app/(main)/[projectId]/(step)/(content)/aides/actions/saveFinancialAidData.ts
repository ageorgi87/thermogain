"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { financialAidSchema, type FinancialAidData } from "./financialAidSchema"

interface SaveFinancialAidDataParams {
  projectId: string
  data: FinancialAidData
}

export const saveFinancialAidData = async ({
  projectId,
  data,
}: SaveFinancialAidDataParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const validatedData = financialAidSchema.parse(data)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  // Convert undefined values to 0 for Prisma (which doesn't accept undefined for Float fields)
  const prismaData = {
    ma_prime_renov: validatedData.ma_prime_renov ?? 0,
    cee: validatedData.cee ?? 0,
    autres_aides: validatedData.autres_aides ?? 0,
    total_aides: validatedData.total_aides ?? 0,
  }

  const aides = await prisma.projectAides.upsert({
    where: { projectId },
    create: {
      ...prismaData,
      projectId,
    },
    update: prismaData,
  })

  if (project.currentStep === 6) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 7 },
    })
  }

  return aides
}
