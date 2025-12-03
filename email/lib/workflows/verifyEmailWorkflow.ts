"use server";

import { findVerificationToken } from "../tokens/findVerificationToken";
import { isTokenExpired } from "../tokens/isTokenExpired";
import { deleteVerificationToken } from "../tokens/deleteVerificationToken";
import { markEmailAsVerified } from "../users/markEmailAsVerified";

/**
 * Workflow complet pour vérifier un email avec un token
 *
 * Orchestration:
 * 1. Recherche le token en base de données
 * 2. Valide que le token existe et n'est pas expiré
 * 3. Marque l'email comme vérifié
 * 4. Supprime le token utilisé
 */
export async function verifyEmailWorkflow(
  token: string
): Promise<{ success?: boolean; error?: string }> {
  // 1. Rechercher le token
  const verificationToken = await findVerificationToken(token);

  if (!verificationToken) {
    return { error: "Token invalide" };
  }

  // 2. Vérifier l'expiration
  if (isTokenExpired(verificationToken.expires)) {
    // Supprimer le token expiré
    await deleteVerificationToken(token);
    return { error: "Token expiré" };
  }

  // 3. Marquer l'email comme vérifié
  await markEmailAsVerified(verificationToken.email);

  // 4. Supprimer le token (usage unique)
  await deleteVerificationToken(token);

  return { success: true };
}
