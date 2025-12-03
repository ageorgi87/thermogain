"use server";

import { prisma } from "@/lib/prisma";

/**
 * Supprime un token de vérification de la base de données
 */
export async function deleteVerificationToken(token: string): Promise<void> {
  await prisma.emailVerificationToken.delete({
    where: { token },
  });
}
