"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const deleteProject = async (id: string): Promise<{ success: boolean }> => {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new Error("Non autorisé")
    }

    const result = await prisma.project.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (result.count === 0) {
      throw new Error("Projet non trouvé")
    }

    revalidatePath("/projects")
    return { success: true }
  } catch (error) {
    console.error("[deleteProject] Error:", error)
    throw error
  }
}
