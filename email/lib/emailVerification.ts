/**
 * Barrel file pour les fonctions de vérification d'email
 * Réexporte toutes les fonctions pour maintenir la compatibilité
 */

export { createVerificationToken } from "./createVerificationToken";
export { verifyEmailToken } from "./verifyEmailToken";
export { resendVerificationEmail } from "./resendVerificationEmail";
