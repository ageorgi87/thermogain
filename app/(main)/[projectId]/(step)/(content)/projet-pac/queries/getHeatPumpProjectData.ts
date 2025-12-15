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

  // Map Prisma data to HeatPumpProjectData type (using English field names)
  const heatPump: Partial<HeatPumpProjectData> | null = project.heatPump ? {
    heatPumpType: project.heatPump.heatPumpType as HeatPumpProjectData["heatPumpType"],
    electricityPricePerKwh: project.heatPump.electricityPricePerKwh ?? undefined,
    currentSubscribedPowerKva: project.heatPump.currentSubscribedPowerKva ?? undefined,
    heatPumpPowerKw: project.heatPump.heatPumpPowerKw ?? undefined,
    estimatedCop: project.heatPump.estimatedCop ?? undefined,
    heatPumpLifespanYears: project.heatPump.heatPumpLifespanYears ?? undefined,
    heatPumpSubscribedPowerKva: project.heatPump.heatPumpSubscribedPowerKva ?? undefined,
    annualMaintenanceCost: project.heatPump.annualMaintenanceCost ?? undefined,
    heatPumpElectricityPricePerKwh: project.heatPump.heatPumpElectricityPricePerKwh ?? undefined,
    emitters: project.heatPump.emitters as HeatPumpProjectData["emitters"] ?? undefined,
  } : null

  return {
    heatPump,
    currentHeating: project.currentHeating,
  }
}
