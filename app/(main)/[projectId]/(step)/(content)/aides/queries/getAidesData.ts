"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ClasseDPE } from "@/types/dpe"

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
      aides: true,
      projetPac: {
        select: {
          type_pac: true,
        },
      },
      logement: {
        select: {
          annee_construction: true,
          code_postal: true,
          surface_habitable: true,
          nombre_occupants: true,
          classe_dpe: true,
        },
      },
    },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  if (!project.logement?.classe_dpe) {
    throw new Error("DPE manquant - veuillez compléter l'étape logement")
  }

  return {
    aides: project.aides,
    projetPac: project.projetPac,
    logement: project.logement,
    dpe: project.logement.classe_dpe as ClasseDPE,
  }
}
