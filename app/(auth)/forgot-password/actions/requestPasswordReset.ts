"use server"

import { prisma } from "@/lib/prisma"
import { resend, EMAIL_FROM } from "@/email/lib/resend"
import { PasswordResetEmail } from "@/email/templates/PasswordResetEmail"
import { render } from "@react-email/render"
import { generateToken } from "@/email/lib/tokens/generateToken"

// Token expires in 1 hour (bonnes pratiques 2025)
const PASSWORD_RESET_EXPIRES_IN = 60 * 60 * 1000

/**
 * Demande de réinitialisation de mot de passe
 *
 * Bonnes pratiques de sécurité :
 * - Ne révèle pas si l'email existe ou non (prévention énumération)
 * - Invalide les anciens tokens
 * - Token expire après 1 heure
 * - Envoie un email uniquement si l'utilisateur existe
 */
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  // Valider l'email
  if (!email || !email.includes("@")) {
    return {
      success: true,
      message:
        "Si cette adresse email existe, vous recevrez un lien de réinitialisation.",
    }
  }

  // Vérifier si l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true },
  })

  // Ne pas révéler si l'email existe (prévention énumération)
  if (!user) {
    return {
      success: true,
      message:
        "Si cette adresse email existe, vous recevrez un lien de réinitialisation.",
    }
  }

  // Supprimer les anciens tokens pour cet email
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  })

  // Créer un nouveau token
  const token = generateToken()
  const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRES_IN)

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  })

  // Construire l'URL de réinitialisation
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  // Rendre le template email
  const emailHtml = await render(
    PasswordResetEmail({ resetUrl, firstName: user.firstName || undefined })
  )

  // Envoyer l'email
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Réinitialisez votre mot de passe ThermoGain",
      html: emailHtml,
    })
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    throw new Error("Impossible d'envoyer l'email de réinitialisation")
  }

  return {
    success: true,
    message:
      "Si cette adresse email existe, vous recevrez un lien de réinitialisation.",
  }
}
