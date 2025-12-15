"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface GetCostsDataParams {
  projectId: string
}

export const getCostsData = async ({ projectId }: GetCostsDataParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      costs: true,
    },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  return {
    costs: project.costs,
  }
}
