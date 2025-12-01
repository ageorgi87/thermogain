"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  company?: string
  siret?: string
  address?: string
  city?: string
  postalCode?: string
  website?: string
}

export async function updateProfile(data: UpdateProfileData) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Non authentifié",
      }
    }

    // Mise à jour du profil en base de données
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company,
        siret: data.siret,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        website: data.website,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour",
    }
  }
}
