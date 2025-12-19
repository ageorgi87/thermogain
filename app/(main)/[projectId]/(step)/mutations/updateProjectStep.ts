"use server"

import { verifyProjectAccess } from "@/lib/auth/verifyProjectAccess"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { Project } from "@prisma/client"

export const updateProjectStep = async (
  id: string,
  currentStep: number
): Promise<Project> => {
  try {
    await verifyProjectAccess({ projectId: id })

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { currentStep },
    })

    revalidatePath(`/projects/${id}`)
    return updatedProject
  } catch (error) {
    console.error("[updateProjectStep] Error:", error)
    throw error
  }
}
