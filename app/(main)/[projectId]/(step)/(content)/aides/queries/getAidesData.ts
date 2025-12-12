"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface GetAidesDataParams {
  projectId: string
}

export const getAidesData = async ({ projectId }: GetAidesDataParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      aides: {
        select: {
          // Montants des aides
          ma_prime_renov: true,
          cee: true,
          autres_aides: true,
          total_aides: true,
          // Critères d'éligibilité sauvegardés
          type_logement: true,
          revenu_fiscal_reference: true,
          residence_principale: true,
          remplacement_complet: true,
        },
      },
    },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  return {
    aides: project.aides,
  }
}
