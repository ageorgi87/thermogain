"use server";

import { prisma } from "@/lib/prisma";

/**
 * Recherche un token de vérification dans la base de données
 */
export async function findVerificationToken(token: string) {
  return prisma.emailVerificationToken.findUnique({
    where: { token },
  });
}
