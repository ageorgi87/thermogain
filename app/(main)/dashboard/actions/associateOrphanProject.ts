"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface AssociateOrphanProjectParams {
  projectId: string
}

/**
 * Associates an orphan project (userId = null) with the authenticated user
 * Only works if the project is currently orphaned
 */
export const associateOrphanProject = async ({
  projectId,
}: AssociateOrphanProjectParams): Promise<{ success: boolean; error?: string }> => {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: "Non autorisé" }
    }

    // Check if project exists and is orphaned
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true },
    })

    if (!project) {
      return { success: false, error: "Projet non trouvé" }
    }

    if (project.userId !== null) {
      return { success: false, error: "Le projet est déjà associé à un utilisateur" }
    }

    // Associate project with user
    await prisma.project.update({
      where: { id: projectId },
      data: { userId: session.user.id },
    })

    return { success: true }
  } catch (error) {
    console.error("[associateOrphanProject] Error:", error)
    return { success: false, error: "Erreur lors de l'association du projet" }
  }
}
