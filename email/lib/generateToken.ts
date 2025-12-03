import crypto from "crypto";

/**
 * Génère un token de vérification unique
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
