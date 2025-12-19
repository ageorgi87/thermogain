"use server"

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess"
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
  await verifyProjectAccess({ projectId })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      currentHeating: true,
      heatPump: {
        select: {
          heatPumpType: true,
          withDhwManagement: true,
        },
      },
    },
  })

  if (!project) {
    throw new Error("Projet non trouvé")
  }

  return {
    currentHeating: project.currentHeating,
    pacInfo: {
      typePac: project.heatPump?.heatPumpType || null,
      withEcsManagement: project.heatPump?.withDhwManagement ?? null,
    },
  }
}
