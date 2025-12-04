"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface GetCoutsDataParams {
  projectId: string
}

export const getCoutsData = async ({ projectId }: GetCoutsDataParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      couts: true,
    },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  return {
    couts: project.couts,
  }
}
