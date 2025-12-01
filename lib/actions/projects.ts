"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createProject(data?: { name?: string }) {
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
}

export async function getProject(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
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
}

export async function getProjects() {
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
}

export async function updateProjectStep(
  id: string,
  currentStep: number
) {
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
}

export async function deleteProject(id: string) {
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
}
