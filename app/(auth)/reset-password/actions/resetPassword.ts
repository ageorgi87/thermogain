"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { verifyResetToken } from "@/app/(auth)/reset-password/actions/verifyResetToken";

/**
 * Réinitialise le mot de passe avec un token valide
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ error?: string; success?: boolean }> => {
  // Valider le token
  const verification = await verifyResetToken(token);

  if (verification.error) {
    return { error: verification.error };
  }

  // Valider le nouveau mot de passe
  if (!newPassword || newPassword.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères" };
  }

  // Hash le nouveau mot de passe
  const hashedPassword = await hash(newPassword, 12);

  // Mettre à jour le mot de passe de l'utilisateur
  await prisma.user.update({
    where: { email: verification.email },
    data: { password: hashedPassword },
  });

  // Supprimer le token utilisé (à usage unique)
  await prisma.passwordResetToken.delete({
    where: { token },
  });

  // Supprimer tous les autres tokens pour cet email (sécurité)
  await prisma.passwordResetToken.deleteMany({
    where: { email: verification.email },
  });

  return { success: true };
};
