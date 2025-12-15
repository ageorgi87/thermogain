"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ProjectCurrentHeating } from "@prisma/client"

interface GetCurrentHeatingDataParams {
  projectId: string
}

interface GetCurrentHeatingDataResult {
  currentHeating: ProjectCurrentHeating | null
  pacInfo: {
    typePac: string | null
    withEcsManagement: boolean | null
  }
}

/**
 * Retrieves current heating data and heat pump info for a project
 * Optimized query for the current heating page
 */
export const getCurrentHeatingData = async ({
  projectId
}: GetCurrentHeatingDataParams): Promise<GetCurrentHeatingDataResult> => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  // Verify that the project belongs to the user
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      currentHeating: true,
      projetPac: {
        select: {
          type_pac: true,
          with_ecs_management: true,
        },
      },
    },
  })

  if (!project) {
    throw new Error("Projet non trouvé")
  }

  if (project.userId !== session.user.id) {
    throw new Error("Non autorisé")
  }

  return {
    currentHeating: project.currentHeating,
    pacInfo: {
      typePac: project.projetPac?.type_pac || null,
      withEcsManagement: project.projetPac?.with_ecs_management ?? null,
    },
  }
}
