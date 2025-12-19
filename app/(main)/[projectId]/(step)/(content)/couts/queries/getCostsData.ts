"use server"

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess"
import { prisma } from "@/lib/prisma"

interface GetCostsDataParams {
  projectId: string
}

export const getCostsData = async ({ projectId }: GetCostsDataParams) => {
  await verifyProjectAccess({ projectId })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      costs: true,
    },
  })

  if (!project) {
    throw new Error("Projet non trouvé")
  }

  return {
    costs: project.costs,
  }
}
