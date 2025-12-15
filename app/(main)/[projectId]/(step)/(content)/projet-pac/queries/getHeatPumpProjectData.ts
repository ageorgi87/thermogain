"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { HeatPumpProjectData } from "@/app/(main)/[projectId]/(step)/(content)/projet-pac/actions/heatPumpProjectSchema"

interface GetHeatPumpProjectDataParams {
  projectId: string
}

export const getHeatPumpProjectData = async ({ projectId }: GetHeatPumpProjectDataParams) => {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      heatPump: true,
      currentHeating: true,
    },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  // Map Prisma data to HeatPumpProjectData type
  const heatPump: Partial<HeatPumpProjectData> | null = project.heatPump ? {
    type_pac: project.heatPump.heatPumpType as HeatPumpProjectData["type_pac"],
    prix_elec_kwh: project.heatPump.electricityPricePerKwh ?? undefined,
    puissance_souscrite_actuelle: project.heatPump.currentSubscribedPowerKva ?? undefined,
    puissance_pac_kw: project.heatPump.heatPumpPowerKw ?? undefined,
    cop_estime: project.heatPump.estimatedCop ?? undefined,
    duree_vie_pac: project.heatPump.heatPumpLifespanYears ?? undefined,
    puissance_souscrite_pac: project.heatPump.heatPumpSubscribedPowerKva ?? undefined,
    entretien_pac_annuel: project.heatPump.annualMaintenanceCost ?? undefined,
    prix_elec_pac: project.heatPump.heatPumpElectricityPricePerKwh ?? undefined,
    emetteurs: project.heatPump.emitters as HeatPumpProjectData["emetteurs"] ?? undefined,
  } : null

  return {
    heatPump,
    currentHeating: project.currentHeating,
  }
}
