"use server";

import { prisma } from "@/lib/prisma";

/**
 * Marque l'email d'un utilisateur comme vérifié
 */
export async function markEmailAsVerified(email: string): Promise<void> {
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });
}
