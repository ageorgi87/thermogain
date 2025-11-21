import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { evolutionsSchema } from "@/lib/schemas/heating-form"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

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
    const { heatingProjectId, ...evolutionsData } = body
    const validatedData = evolutionsSchema.parse(evolutionsData)

    // Check if heating project exists and belongs to user
    const heatingProject = await prisma.heatingProject.findUnique({
      where: { id: heatingProjectId },
    })

    if (!heatingProject || heatingProject.userId !== user.id) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }

    // Upsert evolutions data
    const evolutions = await prisma.heatingProjectEvolutions.upsert({
      where: { heatingProjectId },
      create: {
        ...validatedData,
        heatingProjectId,
      },
      update: validatedData,
    })

    // Mark project as completed (final step)
    await prisma.heatingProject.update({
      where: { id: heatingProjectId },
      data: { completed: true },
    })

    return NextResponse.json(evolutions)
  } catch (error) {
    console.error("Error saving evolutions data:", error)
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde des données" },
      { status: 500 }
    )
  }
}
