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
        },
      },
    },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  return {
    aides: project.aides,
    projetPac: project.projetPac,
    logement: project.logement,
  }
}
