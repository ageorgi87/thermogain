"use server"

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess"
import { prisma } from "@/lib/prisma"
import type { HeatPumpProjectData } from "@/app/(main)/[projectId]/(step)/(content)/projet-pac/actions/heatPumpProjectSchema"

interface GetHeatPumpProjectDataParams {
  projectId: string
}

export const getHeatPumpProjectData = async ({ projectId }: GetHeatPumpProjectDataParams) => {
  await verifyProjectAccess({ projectId })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      heatPump: true,
      currentHeating: true,
    },
  })

  if (!project) {
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
