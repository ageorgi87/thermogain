"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface GetHousingDataParams {
  projectId: string
}

export const getHousingData = async ({ projectId }: GetHousingDataParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      housing: true,
    },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  return {
    housing: project.housing,
  }
}
