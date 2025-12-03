"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export const createProject = async (data?: { name?: string }) => {
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

export const getProject = async (id: string) => {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      throw new Error("Non autorisé")
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: true,
        logement: true,
        chauffageActuel: true,
        projetPac: true,
        couts: true,
        aides: true,
        financement: true,
        evolutions: true,
      },
    })

    if (!project || project.userId !== session.user.id) {
      throw new Error("Projet non trouvé")
    }

    // Convert to plain JSON to ensure proper serialization for Next.js
    return JSON.parse(JSON.stringify(project))
  } catch (error) {
    console.error("[getProject] Error:", error)
    throw error
  }
}

export const getProjects = async () => {
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

export const updateProjectStep = async (
  id: string,
  currentStep: number
) => {
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

export const deleteProject = async (id: string) => {
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
