"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { evolutionsSchema, type EvolutionsData } from "./evolutionsSchema"

/**
 * Récupère les évolutions de prix par défaut depuis le cache
 */
export async function getDefaultEvolutions() {
  try {
    const energyPrices = await prisma.energyPriceCache.findMany({
      select: {
        energyType: true,
        evolution_10y: true,
        lastUpdated: true,
      }
    })

    const evolutionsMap: Record<string, number> = {}
    energyPrices.forEach(price => {
      evolutionsMap[price.energyType] = price.evolution_10y
    })

    return {
      evolution_prix_fioul: evolutionsMap['fioul'] || 5,
      evolution_prix_gaz: evolutionsMap['gaz'] || 5,
      evolution_prix_gpl: evolutionsMap['gpl'] || 5,
      evolution_prix_bois: evolutionsMap['bois'] || 5,
      evolution_prix_electricite: evolutionsMap['electricite'] || 3,
      lastUpdated: energyPrices[0]?.lastUpdated || new Date(),
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des évolutions par défaut:", error)

    // Valeurs par défaut en cas d'erreur
    return {
      evolution_prix_fioul: 5,
      evolution_prix_gaz: 5,
      evolution_prix_gpl: 5,
      evolution_prix_bois: 5,
      evolution_prix_electricite: 3,
      lastUpdated: new Date(),
    }
  }
}

export async function saveEvolutionsData(projectId: string, data: EvolutionsData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const validatedData = evolutionsSchema.parse(data)

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  const evolutions = await prisma.projectEvolutions.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    } as any,
    update: validatedData as any,
  })

  // Mark project as completed (final step)
  if (project.currentStep === 7) {
    await prisma.project.update({
      where: { id: projectId },
      data: { completed: true },
    })
  }

  return evolutions
}
