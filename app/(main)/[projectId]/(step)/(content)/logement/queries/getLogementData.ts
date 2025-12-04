"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { HousingData } from "@/app/(main)/[projectId]/(step)/(content)/logement/actions/housingSchema"

interface GetLogementDataParams {
  projectId: string
}

export const getLogementData = async ({ projectId }: GetLogementDataParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      logement: true,
    },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  // Map Prisma data to HousingData type
  const logement: Partial<HousingData> | null = project.logement ? {
    code_postal: project.logement.code_postal,
    annee_construction: project.logement.annee_construction,
    surface_habitable: project.logement.surface_habitable,
    nombre_occupants: project.logement.nombre_occupants,
    qualite_isolation: project.logement.qualite_isolation as HousingData["qualite_isolation"],
  } : null

  return {
    logement,
  }
}
