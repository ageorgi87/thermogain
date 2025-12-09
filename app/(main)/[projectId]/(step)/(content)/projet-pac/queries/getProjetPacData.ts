"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { HeatPumpProjectData } from "@/app/(main)/[projectId]/(step)/(content)/projet-pac/actions/heatPumpProjectSchema"

interface GetProjetPacDataParams {
  projectId: string
}

export const getProjetPacData = async ({ projectId }: GetProjetPacDataParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      projetPac: true,
      chauffageActuel: true,
    },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  // Map Prisma data to HeatPumpProjectData type
  const projetPac: Partial<HeatPumpProjectData> | null = project.projetPac ? {
    type_pac: project.projetPac.type_pac as HeatPumpProjectData["type_pac"],
    prix_elec_kwh: project.projetPac.prix_elec_kwh ?? undefined,
    puissance_souscrite_actuelle: project.projetPac.puissance_souscrite_actuelle ?? undefined,
    puissance_pac_kw: project.projetPac.puissance_pac_kw ?? undefined,
    cop_estime: project.projetPac.cop_estime ?? undefined,
    duree_vie_pac: project.projetPac.duree_vie_pac ?? undefined,
    puissance_souscrite_pac: project.projetPac.puissance_souscrite_pac ?? undefined,
    entretien_pac_annuel: project.projetPac.entretien_pac_annuel ?? undefined,
    prix_elec_pac: project.projetPac.prix_elec_pac ?? undefined,
    emetteurs: project.projetPac.emetteurs as HeatPumpProjectData["emetteurs"] ?? undefined,
  } : null

  return {
    projetPac,
    chauffageActuel: project.chauffageActuel,
  }
}
