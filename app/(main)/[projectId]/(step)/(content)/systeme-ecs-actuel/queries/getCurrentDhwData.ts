"use server"

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess"
import { prisma } from "@/lib/prisma"
import type { ProjectDhw } from "@prisma/client"
import { EnergyType } from "@/types/energyType"

interface GetCurrentDhwDataParams {
  projectId: string
}

interface GetCurrentDhwDataResult {
  dhw: ProjectDhw | null
  logementInfo: {
    nombreOccupants: number | null
  }
  currentHeatingInfo: {
    dhwIntegrated: boolean | null
  }
  pacInfo: {
    withDhwManagement: boolean | null
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
export const getCurrentDhwData = async ({
  projectId,
}: GetCurrentDhwDataParams): Promise<GetCurrentDhwDataResult> => {
  await verifyProjectAccess({ projectId })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      dhw: true,
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
      heatPump: {
        select: {
          withDhwManagement: true,
        },
      },
    },
  })

  if (!project) {
    throw new Error("Projet non trouvé")
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
    dhw: project.dhw,
    logementInfo: {
      nombreOccupants: project.housing?.numberOfOccupants ?? null,
    },
    currentHeatingInfo: {
      dhwIntegrated: project.currentHeating?.dhwIntegrated ?? null,
    },
    pacInfo: {
      withDhwManagement: project.heatPump?.withDhwManagement ?? null,
    },
    defaultPrices: {
      electricite: electricitePrice,
      gaz: gazPrice,
    },
  }
}
