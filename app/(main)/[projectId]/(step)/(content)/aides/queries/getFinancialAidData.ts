"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface GetFinancialAidDataParams {
  projectId: string
}

export const getFinancialAidData = async ({ projectId }: GetFinancialAidDataParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      financialAid: {
        select: {
          // Montants des aides
          maPrimeRenov: true,
          cee: true,
          otherAid: true,
          totalAid: true,
          // Critères d'éligibilité sauvegardés
          housingType: true,
          referenceTaxIncome: true,
          isPrimaryResidence: true,
          isCompleteReplacement: true,
        },
      },
    },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  return {
    financialAid: project.financialAid,
  }
}
