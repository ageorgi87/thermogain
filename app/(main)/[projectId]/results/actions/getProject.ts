"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const getProject = async (id: string) => {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new Error("Non autorisé")
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: true,
        housing: true,
        chauffageActuel: true,
        projetPac: true,
        couts: true,
        aides: true,
        financement: true,
        evolutions: true,
      },
    })

    if (!project || project.userId !== session.user.id) {
      throw new Error("Projet non trouvé")
    }

    // Convert to plain JSON to ensure proper serialization for Next.js
    return JSON.parse(JSON.stringify(project))
  } catch (error) {
    console.error("[getProject] Error:", error)
    throw error
  }
}
