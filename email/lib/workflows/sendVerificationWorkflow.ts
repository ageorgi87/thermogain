"use server";

import { EMAIL_VERIFICATION_EXPIRES_IN } from "@/email/lib/resend";
import { generateToken } from "../tokens/generateToken";
import { saveVerificationToken } from "../tokens/saveVerificationToken";
import { buildVerificationUrl } from "../emails/buildVerificationUrl";
import { renderVerificationEmail } from "../emails/renderVerificationEmail";
import { sendVerificationEmail } from "../emails/sendVerificationEmail";

/**
 * Workflow complet pour envoyer un email de vérification
 *
 * Orchestration:
 * 1. Génère un token unique
 * 2. Sauvegarde le token en base de données
 * 3. Construit l'URL de vérification
 * 4. Rend le template email
 * 5. Envoie l'email
 */
export async function sendVerificationWorkflow(
  email: string,
  firstName?: string
): Promise<{ success: boolean }> {
  // 1. Générer le token
  const token = generateToken();

  // 2. Sauvegarder en base de données
  await saveVerificationToken(email, token, EMAIL_VERIFICATION_EXPIRES_IN);

  // 3. Construire l'URL
  const verificationUrl = buildVerificationUrl(token);

  // 4. Rendre le template
  const emailHtml = await renderVerificationEmail(verificationUrl, firstName);

  // 5. Envoyer l'email
  await sendVerificationEmail(email, emailHtml);

  return { success: true };
}
