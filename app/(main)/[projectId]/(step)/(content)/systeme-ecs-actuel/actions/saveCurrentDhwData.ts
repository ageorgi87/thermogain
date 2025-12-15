"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { CurrentDhwData } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/actions/currentDhwSchema"
import { estimateDhwConsumption } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/lib/estimateDhwConsumption"

interface SaveCurrentDhwDataParams {
  projectId: string
  data: CurrentDhwData
  nombreOccupants: number | null
}

/**
 * Sauvegarde les données DHW pour un projet
 * Si dhwConsumptionKnown = false, calcule automatiquement la consommation
 */
export const saveCurrentDhwData = async ({
  projectId,
  data,
  nombreOccupants,
}: SaveCurrentDhwDataParams) => {
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
    let finalConsumption = data.dhwConsumptionKwh

    if (!data.dhwConsumptionKnown) {
      // Estimation automatique basée sur le nombre d'occupants
      if (nombreOccupants && nombreOccupants > 0) {
        finalConsumption = estimateDhwConsumption(nombreOccupants)
      } else {
        return {
          error:
            "Impossible d'estimer la consommation sans le nombre d'occupants",
        }
      }
    }

    // Sauvegarder ou mettre à jour les données ECS
    await prisma.projectDhw.upsert({
      where: { projectId },
      create: {
        projectId,
        dhwSystemType: data.dhwSystemType,
        dhwConsumptionKnown: data.dhwConsumptionKnown,
        dhwConsumptionKwh: finalConsumption ?? 0,
        dhwEnergyPricePerKwh: data.dhwEnergyPricePerKwh,
        dhwAnnualMaintenance: data.dhwAnnualMaintenance,
      },
      update: {
        dhwSystemType: data.dhwSystemType,
        dhwConsumptionKnown: data.dhwConsumptionKnown,
        dhwConsumptionKwh: finalConsumption ?? 0,
        dhwEnergyPricePerKwh: data.dhwEnergyPricePerKwh,
        dhwAnnualMaintenance: data.dhwAnnualMaintenance,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("[saveCurrentDhwData] Error:", error)
    return { error: "Une erreur est survenue lors de la sauvegarde" }
  }
}
