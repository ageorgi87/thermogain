"use server";

import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "./createVerificationToken";

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
