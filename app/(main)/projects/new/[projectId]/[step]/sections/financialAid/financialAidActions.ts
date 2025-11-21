"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { financialAidSchema, type FinancialAidData } from "./financialAidSchema"

export async function saveFinancialAidData(projectId: string, data: FinancialAidData) {
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

  const validatedData = financialAidSchema.parse(data)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== user.id) {
    throw new Error("Projet non trouvé")
  }

  const aides = await prisma.projectAides.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    } as any,
    update: validatedData as any,
  })

  if (project.currentStep === 6) {
    await prisma.project.update({
      where: { id: projectId },
      data: { currentStep: 7 },
    })
  }

  return aides
}
