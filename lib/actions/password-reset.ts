"use server";

import { prisma } from "@/lib/prisma";
import { resend, EMAIL_FROM } from "@/email/lib/resend";
import { PasswordResetEmail } from "@/email/templates/PasswordResetEmail";
import { render } from "@react-email/render";
import { hash } from "bcryptjs";
import { generateToken } from "@/email/lib/generateToken";

// Token expires in 1 hour (bonnes pratiques 2025)
const PASSWORD_RESET_EXPIRES_IN = 60 * 60 * 1000;

/**
 * Demande de réinitialisation de mot de passe
 *
 * Bonnes pratiques de sécurité :
 * - Ne révèle pas si l'email existe ou non (prévention énumération)
 * - Invalide les anciens tokens
 * - Token expire après 1 heure
 * - Envoie un email uniquement si l'utilisateur existe
 */
export async function requestPasswordReset(email: string) {
  // Valider l'email
  if (!email || !email.includes("@")) {
    return {
      success: true,
      message:
        "Si cette adresse email existe, vous recevrez un lien de réinitialisation.",
    };
  }

  // Vérifier si l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true },
  });

  // Ne pas révéler si l'email existe (prévention énumération)
  if (!user) {
    return {
      success: true,
      message:
        "Si cette adresse email existe, vous recevrez un lien de réinitialisation.",
    };
  }

  // Supprimer les anciens tokens pour cet email
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  // Créer un nouveau token
  const token = generateToken();
  const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRES_IN);

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  // Construire l'URL de réinitialisation
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  // Rendre le template email
  const emailHtml = await render(
    PasswordResetEmail({ resetUrl, firstName: user.firstName || undefined })
  );

  // Envoyer l'email
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Réinitialisez votre mot de passe ThermoGain",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Impossible d'envoyer l'email de réinitialisation");
  }

  return {
    success: true,
    message:
      "Si cette adresse email existe, vous recevrez un lien de réinitialisation.",
  };
}

/**
 * Vérifie la validité d'un token de réinitialisation
 */
export async function verifyResetToken(token: string) {
  if (!token) {
    return { error: "Token manquant" };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return { error: "Token invalide ou expiré" };
  }

  if (resetToken.expires < new Date()) {
    // Token expiré, le supprimer
    await prisma.passwordResetToken.delete({
      where: { token },
    });
    return { error: "Token expiré" };
  }

  return { success: true, email: resetToken.email };
}

/**
 * Réinitialise le mot de passe avec un token valide
 */
export async function resetPassword(token: string, newPassword: string) {
  // Valider le token
  const verification = await verifyResetToken(token);

  if (verification.error) {
    return { error: verification.error };
  }

  // Valider le nouveau mot de passe
  if (!newPassword || newPassword.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères" };
  }

  // Hash le nouveau mot de passe
  const hashedPassword = await hash(newPassword, 12);

  // Mettre à jour le mot de passe de l'utilisateur
  await prisma.user.update({
    where: { email: verification.email },
    data: { password: hashedPassword },
  });

  // Supprimer le token utilisé (à usage unique)
  await prisma.passwordResetToken.delete({
    where: { token },
  });

  // Supprimer tous les autres tokens pour cet email (sécurité)
  await prisma.passwordResetToken.deleteMany({
    where: { email: verification.email },
  });

  return { success: true };
}
