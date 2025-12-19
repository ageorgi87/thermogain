"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface VerifyProjectAccessParams {
  projectId: string
}

/**
 * Vérifie l'accès à un projet selon ces règles :
 * - Projet avec userId : vérifier que l'utilisateur connecté est propriétaire
 * - Projet sans userId (orphelin) : accès libre sans authentification
 *
 * @param projectId - ID du projet à vérifier
 * @throws Error si projet introuvable ou accès non autorisé
 */
export const verifyProjectAccess = async ({
  projectId,
}: VerifyProjectAccessParams): Promise<void> => {
  const session = await auth()

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      userId: true,
    },
  })

  if (!project) {
    throw new Error("Projet non trouvé")
  }

  // Si le projet a un userId, vérifier que l'utilisateur connecté est propriétaire
  if (project.userId) {
    if (!session?.user?.id || project.userId !== session.user.id) {
      throw new Error("Non autorisé - ce projet appartient à un utilisateur")
    }
  }

  // Si le projet n'a pas de userId (orphelin), accès autorisé sans vérification
}
