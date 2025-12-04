"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { Project } from "@prisma/client"

export const updateProjectStep = async (
  id: string,
  currentStep: number
): Promise<Project> => {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new Error("Non autorisé")
    }

    const project = await prisma.project.findUnique({
      where: { id },
    })

    if (!project || project.userId !== session.user.id) {
      throw new Error("Projet non trouvé")
    }

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
