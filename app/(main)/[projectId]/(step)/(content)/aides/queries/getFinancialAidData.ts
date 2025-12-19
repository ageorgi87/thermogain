"use server"

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess"
import { prisma } from "@/lib/prisma"

interface GetFinancialAidDataParams {
  projectId: string
}

export const getFinancialAidData = async ({ projectId }: GetFinancialAidDataParams) => {
  await verifyProjectAccess({ projectId })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
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

  if (!project) {
    throw new Error("Projet non trouvé")
  }

  return {
    financialAid: project.financialAid,
  }
}
