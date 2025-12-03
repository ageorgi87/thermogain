"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Project } from "@prisma/client"

export const getProjects = async (): Promise<Project[]> => {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new Error("Non autorisé")
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        name: {
          not: ""
        }
      },
      orderBy: { createdAt: "desc" },
    })

    return projects
  } catch (error) {
    console.error("[getProjects] Error:", error)
    throw error
  }
}
