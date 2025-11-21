import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Initialize a new heating project (wizard entry point)
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
    const { name } = body

    // Create a new empty heating project
    const heatingProject = await prisma.heatingProject.create({
      data: {
        name: name || "Projet PAC",
        currentStep: 1,
        completed: false,
        userId: user.id,
      },
    })

    return NextResponse.json(heatingProject)
  } catch (error) {
    console.error("Error creating heating project:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    )
  }
}

export async function GET() {
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

    const heatingProjects = await prisma.heatingProject.findMany({
      where: { userId: user.id },
      include: {
        logement: true,
        chauffageActuel: true,
        consommation: true,
        projetPac: true,
        couts: true,
        aides: true,
        financement: true,
        evolutions: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(heatingProjects)
  } catch (error) {
    console.error("Error fetching heating projects:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    )
  }
}
