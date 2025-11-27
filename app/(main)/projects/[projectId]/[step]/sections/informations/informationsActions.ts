"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { informationsSchema, type InformationsData } from "./informationsSchema"

export async function saveInformationsData(projectId: string, data: InformationsData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Non autorisé")
  }

  const validatedData = informationsSchema.parse(data)

  // Check if project exists and belongs to user
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.userId !== session.user.id) {
    throw new Error("Projet non trouvé")
  }

  // Update project name and recipientEmails
  await prisma.project.update({
    where: { id: projectId },
    data: {
      name: validatedData.project_name,
      recipientEmails: validatedData.recipient_emails,
    },
  })

  // Upsert informations data
  const informations = await prisma.projectInformations.upsert({
    where: { projectId },
    create: {
      ...validatedData,
      projectId,
    } as any,
    update: validatedData as any,
  })

  return informations
}
