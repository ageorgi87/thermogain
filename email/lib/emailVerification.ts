"use server";

import { prisma } from "@/lib/prisma";
import {
  resend,
  EMAIL_FROM,
  EMAIL_VERIFICATION_EXPIRES_IN,
} from "@/email/lib/resend";
import { VerificationEmail } from "@/email/templates/verification-email";
import { render } from "@react-email/render";
import crypto from "crypto";

/**
 * Génère un token de vérification unique
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Crée un token de vérification et envoie l'email
 */
export async function createVerificationToken(
  email: string,
  firstName?: string
) {
  const token = generateToken();
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRES_IN);

  // Supprimer les anciens tokens pour cet email
  await prisma.emailVerificationToken.deleteMany({
    where: { email },
  });

  // Créer le nouveau token
  await prisma.emailVerificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  // Construire l'URL de vérification
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  // Rendre le template email
  const emailHtml = await render(
    VerificationEmail({ verificationUrl, firstName })
  );

  // Envoyer l'email
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Confirmez votre email ThermoGain",
      html: emailHtml,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Impossible d'envoyer l'email de vérification");
  }
}

/**
 * Vérifie un token et active le compte
 */
export async function verifyEmailToken(token: string) {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return { error: "Token invalide" };
  }

  if (verificationToken.expires < new Date()) {
    // Token expiré, le supprimer
    await prisma.emailVerificationToken.delete({
      where: { token },
    });
    return { error: "Token expiré" };
  }

  // Mettre à jour l'utilisateur pour marquer l'email comme vérifié
  await prisma.user.update({
    where: { email: verificationToken.email },
    data: { emailVerified: new Date() },
  });

  // Supprimer le token
  await prisma.emailVerificationToken.delete({
    where: { token },
  });

  return { success: true };
}

/**
 * Renvoie un email de vérification
 */
export async function resendVerificationEmail(email: string) {
  // Vérifier que l'utilisateur existe et n'est pas déjà vérifié
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "Utilisateur non trouvé" };
  }

  if (user.emailVerified) {
    return { error: "Email déjà vérifié" };
  }

  // Créer et envoyer un nouveau token
  await createVerificationToken(email, user.firstName || undefined);

  return { success: true };
}
