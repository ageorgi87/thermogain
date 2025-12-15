"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { FinancingData } from "@/app/(main)/[projectId]/(step)/(content)/financement/actions/saveFinancingData/saveFinancingDataSchema"

interface GetFinancementDataParams {
  projectId: string
}

export const getFinancementData = async ({ projectId }: GetFinancementDataParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      financement: true,
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

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  // Map Prisma data to FinancingData type
  const financement: Partial<FinancingData> | null = project.financement ? {
    mode_financement: project.financement.mode_financement as FinancingData["mode_financement"],
    apport_personnel: project.financement.apport_personnel ?? undefined,
    montant_credit: project.financement.montant_credit ?? undefined,
    taux_interet: project.financement.taux_interet ?? undefined,
    duree_credit_mois: project.financement.duree_credit_mois ?? undefined,
  } : null

  return {
    financement,
    costs: project.costs,
    financialAid: project.financialAid,
  }
}
