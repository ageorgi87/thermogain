"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { EcsActuelData } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/actions/ecsActuelSchema"
import { estimateEcsConsumption } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/lib/estimateEcsConsumption"

interface SaveEcsActuelDataParams {
  projectId: string
  data: EcsActuelData
  nombreOccupants: number | null
}

/**
 * Sauvegarde les données ECS pour un projet
 * Si consumption_known = false, calcule automatiquement la consommation
 */
export const saveEcsActuelData = async ({
  projectId,
  data,
  nombreOccupants,
}: SaveEcsActuelDataParams) => {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "Non authentifié" }
    }

    // Vérifier que le projet appartient à l'utilisateur
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    })

    if (!project) {
      return { error: "Projet non trouvé" }
    }

    if (project.userId !== session.user.id) {
      return { error: "Non autorisé" }
    }

    // Calculer la consommation si nécessaire
    let finalConsumption = data.conso_ecs_kwh

    if (!data.consumption_known) {
      // Estimation automatique basée sur le nombre d'occupants
      if (nombreOccupants && nombreOccupants > 0) {
        finalConsumption = estimateEcsConsumption(nombreOccupants)
      } else {
        return {
          error:
            "Impossible d'estimer la consommation sans le nombre d'occupants",
        }
      }
    }

    // Sauvegarder ou mettre à jour les données ECS
    await prisma.projectEcs.upsert({
      where: { projectId },
      create: {
        projectId,
        type_ecs: data.type_ecs,
        consumption_known: data.consumption_known,
        conso_ecs_kwh: finalConsumption ?? 0,
        prix_ecs_kwh: data.prix_ecs_kwh,
        entretien_ecs: data.entretien_ecs,
      },
      update: {
        type_ecs: data.type_ecs,
        consumption_known: data.consumption_known,
        conso_ecs_kwh: finalConsumption ?? 0,
        prix_ecs_kwh: data.prix_ecs_kwh,
        entretien_ecs: data.entretien_ecs,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("[saveEcsActuelData] Error:", error)
    return { error: "Une erreur est survenue lors de la sauvegarde" }
  }
}
