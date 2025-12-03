/**
 * Construit l'URL de vérification d'email avec le token
 */
export function buildVerificationUrl(token: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${baseUrl}/verify-email?token=${token}`;
}
