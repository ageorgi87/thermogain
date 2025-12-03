"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { Project } from "@prisma/client"

export const createProject = async (data?: { name?: string }): Promise<Project> => {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new Error("Non autorisé")
    }

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name: data?.name || "", // Empty by default - user must provide a name in step 1
        currentStep: 1,
        completed: false,
      },
    })

    revalidatePath("/projects")
    return project
  } catch (error) {
    console.error("[createProject] Error:", error)
    throw error
  }
}
