"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface GetLogementDataParams {
  projectId: string
}

export const getLogementData = async ({ projectId }: GetLogementDataParams) => {
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
