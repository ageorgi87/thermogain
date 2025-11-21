import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { financementSchema } from "@/lib/schemas/heating-form"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const body = await req.json()
    const { heatingProjectId, ...financementData } = body
    const validatedData = financementSchema.parse(financementData)

    // Check if heating project exists and belongs to user
    const heatingProject = await prisma.heatingProject.findUnique({
      where: { id: heatingProjectId },
    })

    if (!heatingProject || heatingProject.userId !== user.id) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }

    // Upsert financement data
    const financement = await prisma.heatingProjectFinancement.upsert({
      where: { heatingProjectId },
      create: {
        ...validatedData,
        heatingProjectId,
      },
      update: validatedData,
    })

    // Update project's current step if needed
    if (heatingProject.currentStep === 7) {
      await prisma.heatingProject.update({
        where: { id: heatingProjectId },
        data: { currentStep: 8 },
      })
    }

    return NextResponse.json(financement)
  } catch (error) {
    console.error("Error saving financement data:", error)
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde des données" },
      { status: 500 }
    )
  }
}
