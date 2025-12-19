"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { Project } from "@prisma/client"

export const createProject = async (data?: {
  name?: string
  userId?: string | null
}): Promise<Project> => {
  try {
    let finalUserId: string | null = null

    // Si userId non fourni (undefined), utiliser la session (comportement actuel)
    if (data?.userId === undefined) {
      const session = await auth()
      if (!session?.user?.id) {
        throw new Error("Non autorisé")
      }
      finalUserId = session.user.id
    } else {
      // userId explicitement fourni (peut être null pour projet orphelin)
      finalUserId = data.userId
    }

    const project = await prisma.project.create({
      data: {
        userId: finalUserId,
        name: data?.name || "", // Empty by default - user must provide a name in step 1
        currentStep: 1,
        completed: false,
      },
    })

    revalidatePath("/dashboard")
    return project
  } catch (error) {
    console.error("[createProject] Error:", error)
    throw error
  }
}
