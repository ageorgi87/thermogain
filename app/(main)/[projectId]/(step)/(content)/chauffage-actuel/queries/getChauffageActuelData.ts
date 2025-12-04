"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ProjectChauffageActuel } from "@prisma/client"

interface GetChauffageActuelDataParams {
  projectId: string
}

interface GetChauffageActuelDataResult {
  chauffageActuel: ProjectChauffageActuel | null
}

/**
 * Récupère uniquement les données de chauffage actuel pour un projet
 * Query optimisée pour la page chauffage-actuel
 */
export const getChauffageActuelData = async ({
  projectId
}: GetChauffageActuelDataParams): Promise<GetChauffageActuelDataResult> => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  // Vérifier que le projet appartient à l'utilisateur
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      chauffageActuel: true,
    },
  })

  if (!project) {
    throw new Error("Projet non trouvé")
  }

  if (project.userId !== session.user.id) {
    throw new Error("Non autorisé")
  }

  return {
    chauffageActuel: project.chauffageActuel,
  }
}
