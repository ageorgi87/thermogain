"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { evolutionsSchema, type EvolutionsData } from "./evolutionsSchema"
import { getAllEnergyPrices } from "@/lib/energy/priceCache/getAllEnergyPrices"

/**
 * Récupère les évolutions de prix par défaut depuis le cache (ou l'API si besoin)
 * Cette fonction va automatiquement peupler le cache si nécessaire
 */
export async function getDefaultEvolutions() {
  try {
    // Utiliser getAllEnergyPrices qui va automatiquement peupler/mettre à jour le cache
    const evolutions = await getAllEnergyPrices()

    // Récupérer la date de dernière mise à jour depuis le cache
    const firstCachedEntry = await prisma.energyPriceCache.findFirst({
      select: {
        lastUpdated: true,
      },
      orderBy: {
        lastUpdated: 'desc',
      },
    })

    return {
      ...evolutions,
      lastUpdated: firstCachedEntry?.lastUpdated || new Date(),
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
