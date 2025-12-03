"use server";

import { prisma } from "@/lib/prisma";

/**
 * Sauvegarde un token de vérification en base de données
 * Supprime les anciens tokens pour cet email avant de créer le nouveau
 */
export async function saveVerificationToken(
  email: string,
  token: string,
  expiresIn: number
): Promise<void> {
  const expires = new Date(Date.now() + expiresIn);

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
}
