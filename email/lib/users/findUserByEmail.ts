"use server";

import { prisma } from "@/lib/prisma";

/**
 * Recherche un utilisateur par son email
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}
