"use server"

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess"
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
  await verifyProjectAccess({ projectId })

  const validatedData = financialAidSchema.parse(data)

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
    housingType: validatedData.housingType,
    referenceTaxIncome: validatedData.referenceTaxIncome,
    isPrimaryResidence: validatedData.isPrimaryResidence,
    isCompleteReplacement: validatedData.isCompleteReplacement,
    maPrimeRenov: validatedData.maPrimeRenov ?? 0,
    cee: validatedData.cee ?? 0,
    otherAid: validatedData.otherAid ?? 0,
    totalAid: validatedData.totalAid ?? 0,
  }

  const financialAid = await prisma.projectFinancialAid.upsert({
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

  return financialAid
}
