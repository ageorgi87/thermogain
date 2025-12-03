"use server";

import { prisma } from "@/lib/prisma";
import {
  resend,
  EMAIL_FROM,
  EMAIL_VERIFICATION_EXPIRES_IN,
} from "@/email/lib/resend";
import { VerificationEmail } from "@/email/templates/verificationEmail";
import { render } from "@react-email/render";
import { generateToken } from "./generateToken";

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
