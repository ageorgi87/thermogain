/**
 * Valide si un token est expiré
 */
export function isTokenExpired(expirationDate: Date): boolean {
  return expirationDate < new Date();
}
