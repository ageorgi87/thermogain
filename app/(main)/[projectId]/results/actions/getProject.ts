"use server"

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess"
import { prisma } from "@/lib/prisma"

export const getProject = async (id: string) => {
  try {
    await verifyProjectAccess({ projectId: id })

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: true,
        housing: true,
        currentHeating: true,
        heatPump: true,
        costs: true,
        financialAid: true,
        financing: true,
      },
    })

    if (!project) {
      throw new Error("Projet non trouvé")
    }

    // Convert to plain JSON to ensure proper serialization for Next.js
    return JSON.parse(JSON.stringify(project))
  } catch (error) {
    console.error("[getProject] Error:", error)
    throw error
  }
}
