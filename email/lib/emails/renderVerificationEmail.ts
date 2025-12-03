import { render } from "@react-email/render";
import { VerificationEmail } from "@/email/templates/VerificationEmail";

/**
 * Génère le HTML de l'email de vérification à partir du template React
 */
export async function renderVerificationEmail(
  verificationUrl: string,
  firstName?: string
): Promise<string> {
  return render(VerificationEmail({ verificationUrl, firstName }));
}
