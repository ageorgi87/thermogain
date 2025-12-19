"use server"

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess"
import { prisma } from "@/lib/prisma"
import type { FinancingData } from "@/app/(main)/[projectId]/(step)/(content)/financement/actions/saveFinancingData/saveFinancingDataSchema"

interface GetFinancingDataParams {
  projectId: string
}

export const getFinancingData = async ({ projectId }: GetFinancingDataParams) => {
  await verifyProjectAccess({ projectId })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      financing: true,
      costs: {
        select: {
          totalCost: true,
        },
      },
      financialAid: {
        select: {
          totalAid: true,
        },
      },
    },
  })

  if (!project) {
    throw new Error("Projet non trouvé")
  }

  // Map Prisma data to FinancingData type
  const financement: Partial<FinancingData> | null = project.financing ? {
    mode_financement: project.financing.financingMode as FinancingData["mode_financement"],
    apport_personnel: project.financing.downPayment ?? undefined,
    montant_credit: project.financing.loanAmount ?? undefined,
    taux_interet: project.financing.interestRate ?? undefined,
    duree_credit_mois: project.financing.loanDurationMonths ?? undefined,
  } : null

  return {
    financement,
    costs: project.costs,
    financialAid: project.financialAid,
  }
}
