"use server"

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess"
import { prisma } from "@/lib/prisma"

interface GetHousingDataParams {
  projectId: string
}

export const getHousingData = async ({ projectId }: GetHousingDataParams) => {
  await verifyProjectAccess({ projectId })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      housing: true,
    },
  })

  if (!project) {
    throw new Error("Projet non trouvé")
  }

  return {
    housing: project.housing,
  }
}
