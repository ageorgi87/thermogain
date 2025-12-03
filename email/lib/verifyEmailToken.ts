"use server";

import { prisma } from "@/lib/prisma";

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
