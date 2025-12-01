"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface UpdateProfileData {
  name?: string
  phone?: string
  company?: string
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

    // Mise à jour du profil
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone,
        company: data.company,
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
