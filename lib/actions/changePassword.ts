"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export const changePassword = async (data: ChangePasswordData) => {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Non authentifié",
      }
    }

    // Récupérer l'utilisateur avec son mot de passe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user?.password) {
      return {
        success: false,
        error: "Impossible de modifier le mot de passe pour ce compte",
      }
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.password)

    if (!isValidPassword) {
      return {
        success: false,
        error: "Le mot de passe actuel est incorrect",
      }
    }

    // Vérifier que le nouveau mot de passe est différent
    if (data.currentPassword === data.newPassword) {
      return {
        success: false,
        error: "Le nouveau mot de passe doit être différent de l'ancien",
      }
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(data.newPassword, 10)

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error changing password:', error)
    return {
      success: false,
      error: "Une erreur est survenue lors du changement de mot de passe",
    }
  }
}
