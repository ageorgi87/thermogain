"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getProfile() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Non authentifié",
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        company: true,
        siret: true,
        address: true,
        city: true,
        postalCode: true,
        website: true,
      }
    })

    if (!user) {
      return {
        success: false,
        error: "Utilisateur non trouvé",
      }
    }

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return {
      success: false,
      error: "Une erreur est survenue lors de la récupération des données",
    }
  }
}
