"use server"

import { prisma } from "@/lib/prisma"

/**
 * Vérifie la validité d'un token de réinitialisation
 */
export const verifyResetToken = async (token: string): Promise<{ error?: string; success?: boolean; email?: string }> => {
  if (!token) {
    return { error: "Token manquant" }
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (!resetToken) {
    return { error: "Token invalide ou expiré" }
  }

  if (resetToken.expires < new Date()) {
    // Token expiré, le supprimer
    await prisma.passwordResetToken.delete({
      where: { token },
    })
    return { error: "Token expiré" }
  }

  return { success: true, email: resetToken.email }
}
