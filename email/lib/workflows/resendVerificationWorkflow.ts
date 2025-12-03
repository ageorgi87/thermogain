"use server";

import { findUserByEmail } from "../users/findUserByEmail";
import { sendVerificationWorkflow } from "./sendVerificationWorkflow";

/**
 * Workflow pour renvoyer un email de vérification
 *
 * Orchestration:
 * 1. Vérifie que l'utilisateur existe
 * 2. Vérifie que l'email n'est pas déjà vérifié
 * 3. Envoie un nouvel email de vérification
 */
export async function resendVerificationWorkflow(
  email: string
): Promise<{ success?: boolean; error?: string }> {
  // 1. Vérifier que l'utilisateur existe
  const user = await findUserByEmail(email);

  if (!user) {
    return { error: "Utilisateur non trouvé" };
  }

  // 2. Vérifier que l'email n'est pas déjà vérifié
  if (user.emailVerified) {
    return { error: "Email déjà vérifié" };
  }

  // 3. Envoyer un nouveau token
  await sendVerificationWorkflow(email, user.firstName || undefined);

  return { success: true };
}
