"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { HeatPumpProjectData } from "@/app/(main)/[projectId]/(step)/projet-pac/actions/heatPumpProjectSchema"

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
    prix_elec_kwh: project.projetPac.prix_elec_kwh,
    puissance_souscrite_actuelle: project.projetPac.puissance_souscrite_actuelle,
    puissance_pac_kw: project.projetPac.puissance_pac_kw,
    cop_estime: project.projetPac.cop_estime,
    duree_vie_pac: project.projetPac.duree_vie_pac,
    puissance_souscrite_pac: project.projetPac.puissance_souscrite_pac,
    entretien_pac_annuel: project.projetPac.entretien_pac_annuel,
    prix_elec_pac: project.projetPac.prix_elec_pac ?? undefined,
    temperature_depart: project.projetPac.temperature_depart ?? undefined,
    emetteurs: project.projetPac.emetteurs as HeatPumpProjectData["emetteurs"] ?? undefined,
  } : null

  return {
    projetPac,
    chauffageActuel: project.chauffageActuel,
  }
}
