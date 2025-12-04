"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { updateProfileSchema, type UpdateProfileData } from "./updateProfileSchema"

export const updateProfile = async (data: UpdateProfileData) => {
  try {
    // Validation Zod
    const validation = updateProfileSchema.safeParse(data)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0].message,
      }
    }

    const validatedData = validation.data

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
        firstName: validatedData.firstName || null,
        lastName: validatedData.lastName || null,
        phone: validatedData.phone || null,
        company: validatedData.company || null,
        siret: validatedData.siret || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        postalCode: validatedData.postalCode || null,
        website: validatedData.website || null,
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
