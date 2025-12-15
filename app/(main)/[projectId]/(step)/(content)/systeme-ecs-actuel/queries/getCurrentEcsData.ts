"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ProjectEcs } from "@prisma/client"
import { EnergyType } from "@/types/energyType"

interface GetCurrentEcsDataParams {
  projectId: string
}

interface GetCurrentEcsDataResult {
  ecs: ProjectEcs | null
  logementInfo: {
    nombreOccupants: number | null
  }
  currentHeatingInfo: {
    dhwIntegrated: boolean | null
  }
  pacInfo: {
    withEcsManagement: boolean | null
  }
  defaultPrices: {
    electricite: number
    gaz: number
  }
}

/**
 * Récupère les données ECS et les infos nécessaires pour un projet
 * Query optimisée pour la page systeme-ecs-actuel
 */
export const getCurrentEcsData = async ({
  projectId,
}: GetCurrentEcsDataParams): Promise<GetCurrentEcsDataResult> => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non authentifié")
  }

  // Vérifier que le projet appartient à l'utilisateur
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      ecs: true,
      housing: {
        select: {
          numberOfOccupants: true,
        },
      },
      currentHeating: {
        select: {
          dhwIntegrated: true,
        },
      },
      projetPac: {
        select: {
          with_ecs_management: true,
        },
      },
    },
  })

  if (!project) {
    throw new Error("Projet non trouvé")
  }

  if (project.userId !== session.user.id) {
    throw new Error("Non autorisé")
  }

  // Récupérer les prix par défaut depuis la table EnergyPriceCache
  const cachedPrices = await prisma.energyPriceCache.findMany({
    where: {
      energyType: {
        in: [EnergyType.ELECTRICITE, EnergyType.GAZ],
      },
    },
  })

  const electricitePrice =
    cachedPrices.find((c) => c.energyType === EnergyType.ELECTRICITE)?.currentPrice ?? 0
  const gazPrice =
    cachedPrices.find((c) => c.energyType === EnergyType.GAZ)?.currentPrice ?? 0

  return {
    ecs: project.ecs,
    logementInfo: {
      nombreOccupants: project.housing?.numberOfOccupants ?? null,
    },
    currentHeatingInfo: {
      dhwIntegrated: project.currentHeating?.dhwIntegrated ?? null,
    },
    pacInfo: {
      withEcsManagement: project.projetPac?.with_ecs_management ?? null,
    },
    defaultPrices: {
      electricite: electricitePrice,
      gaz: gazPrice,
    },
  }
}
