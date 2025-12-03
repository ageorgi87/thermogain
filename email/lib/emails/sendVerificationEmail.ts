"use server";

import { resend, EMAIL_FROM } from "@/email/lib/resend";

/**
 * Envoie un email de vérification via Resend
 */
export async function sendVerificationEmail(
  email: string,
  emailHtml: string
): Promise<void> {
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Confirmez votre email ThermoGain",
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Impossible d'envoyer l'email de vérification");
  }
}
