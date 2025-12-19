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
    console.log("[associateOrphanProject] Starting, projectId:", projectId)

    const session = await auth()
    console.log("[associateOrphanProject] Session user ID:", session?.user?.id)

    if (!session?.user?.id) {
      console.log("[associateOrphanProject] No session, returning error")
      return { success: false, error: "Non autorisé" }
    }

    // Check if project exists and is orphaned
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true },
    })

    console.log("[associateOrphanProject] Found project:", project)

    if (!project) {
      console.log("[associateOrphanProject] Project not found")
      return { success: false, error: "Projet non trouvé" }
    }

    if (project.userId !== null) {
      console.log("[associateOrphanProject] Project already has userId:", project.userId)
      return { success: false, error: "Le projet est déjà associé à un utilisateur" }
    }

    // Associate project with user
    console.log("[associateOrphanProject] Associating project with user:", session.user.id)
    await prisma.project.update({
      where: { id: projectId },
      data: { userId: session.user.id },
    })

    console.log("[associateOrphanProject] Successfully associated")
    return { success: true }
  } catch (error) {
    console.error("[associateOrphanProject] Error:", error)
    return { success: false, error: "Erreur lors de l'association du projet" }
  }
}
